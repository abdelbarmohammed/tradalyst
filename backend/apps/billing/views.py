import logging
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from apps.users.authentication import CookieJWTAuthentication
from apps.users.models import CustomUser, Plan

logger = logging.getLogger(__name__)

MARKETING_URL = "https://tradalyst.com"
APP_URL = "https://app.tradalyst.com"


def _stripe_client() -> stripe.StripeClient:
    return stripe.StripeClient(settings.STRIPE_SECRET_KEY)


def _get_or_create_customer(user: CustomUser) -> str:
    """Return the Stripe customer ID for this user, creating one if needed."""
    if user.stripe_customer_id:
        return user.stripe_customer_id
    client = _stripe_client()
    customer = client.customers.create(params={"email": user.email, "metadata": {"user_id": str(user.pk)}})
    user.stripe_customer_id = customer.id
    user.save(update_fields=["stripe_customer_id"])
    return customer.id


@api_view(["POST"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_checkout_session(request: Request) -> Response:
    """Create a Stripe Checkout session for the PRO plan."""
    if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_PRO_PRICE_ID:
        return Response({"error": "Billing not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    user: CustomUser = request.user
    customer_id = _get_or_create_customer(user)
    client = _stripe_client()

    try:
        session = client.checkout.sessions.create(params={
            "customer": customer_id,
            "mode": "subscription",
            "line_items": [{"price": settings.STRIPE_PRO_PRICE_ID, "quantity": 1}],
            "subscription_data": {"trial_period_days": 7},
            "success_url": f"{APP_URL}/settings?upgrade=success",
            "cancel_url": f"{APP_URL}/settings?upgrade=cancelled",
            "allow_promotion_codes": True,
        })
    except stripe.StripeError as exc:
        logger.error("Stripe checkout session creation failed: %s", exc)
        return Response({"error": "Could not create checkout session."}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({"url": session.url})


@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_portal_session(request: Request) -> Response:
    """Create a Stripe Customer Portal session for managing the subscription."""
    if not settings.STRIPE_SECRET_KEY:
        return Response({"error": "Billing not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    user: CustomUser = request.user
    if not user.stripe_customer_id:
        return Response({"error": "No active subscription."}, status=status.HTTP_400_BAD_REQUEST)

    client = _stripe_client()

    try:
        session = client.billing_portal.sessions.create(params={
            "customer": user.stripe_customer_id,
            "return_url": f"{APP_URL}/settings",
        })
    except stripe.StripeError as exc:
        logger.error("Stripe portal session creation failed: %s", exc)
        return Response({"error": "Could not open billing portal."}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({"url": session.url})


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def webhook(request: Request) -> Response:
    """Handle Stripe webhook events to keep plan status in sync."""
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    if not settings.STRIPE_WEBHOOK_SECRET:
        return Response({"error": "Webhook not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except stripe.errors.SignatureVerificationError:
        logger.warning("Stripe webhook signature verification failed.")
        return Response({"error": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Invalid payload."}, status=status.HTTP_400_BAD_REQUEST)

    event_type: str = event["type"]
    data_object = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(data_object)
    elif event_type in ("customer.subscription.deleted", "customer.subscription.paused"):
        _handle_subscription_ended(data_object)
    elif event_type == "customer.subscription.updated":
        _handle_subscription_updated(data_object)
    else:
        logger.debug("Unhandled Stripe event: %s", event_type)

    return Response({"received": True})


def _handle_checkout_completed(session: dict) -> None:
    customer_id: str = session.get("customer", "")
    try:
        user = CustomUser.objects.get(stripe_customer_id=customer_id)
        user.plan = Plan.PRO
        user.save(update_fields=["plan"])
        logger.info("Upgraded user %s to PRO via checkout.", user.email)
    except CustomUser.DoesNotExist:
        logger.error("Webhook: no user found for customer %s", customer_id)


def _handle_subscription_ended(subscription: dict) -> None:
    customer_id: str = subscription.get("customer", "")
    try:
        user = CustomUser.objects.get(stripe_customer_id=customer_id)
        user.plan = Plan.FREE
        user.save(update_fields=["plan"])
        logger.info("Downgraded user %s to FREE after subscription ended.", user.email)
    except CustomUser.DoesNotExist:
        logger.error("Webhook: no user found for customer %s", customer_id)


def _handle_subscription_updated(subscription: dict) -> None:
    customer_id: str = subscription.get("customer", "")
    sub_status: str = subscription.get("status", "")
    try:
        user = CustomUser.objects.get(stripe_customer_id=customer_id)
        if sub_status in ("active", "trialing"):
            user.plan = Plan.PRO
        else:
            user.plan = Plan.FREE
        user.save(update_fields=["plan"])
        logger.info("Updated user %s plan to %s (subscription status: %s).", user.email, user.plan, sub_status)
    except CustomUser.DoesNotExist:
        logger.error("Webhook: no user found for customer %s", customer_id)
