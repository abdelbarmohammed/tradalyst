import pytest
import stripe
from unittest.mock import patch, MagicMock
from django.test import override_settings
from rest_framework.test import APIClient

CHECKOUT_URL = "/api/billing/create-checkout-session/"
PORTAL_URL = "/api/billing/portal/"
WEBHOOK_URL = "/api/billing/webhook/"

STRIPE_SETTINGS = {
    "STRIPE_SECRET_KEY": "sk_test_xxxx",
    "STRIPE_PRO_PRICE_ID": "price_test_xxxx",
    "STRIPE_WEBHOOK_SECRET": "whsec_test_xxxx",
}


def _mock_stripe_client(url: str) -> MagicMock:
    """Return a mock StripeClient whose session.url is pre-configured."""
    mock_client = MagicMock()
    mock_session = MagicMock()
    mock_session.url = url
    mock_client.checkout.sessions.create.return_value = mock_session
    mock_client.billing_portal.sessions.create.return_value = mock_session
    return mock_client


@pytest.mark.django_db
class TestCheckoutSession:
    def test_trader_can_create_checkout_session(self, trader_client, trader_user):
        trader_user.stripe_customer_id = "cus_test123"
        trader_user.save()
        mock_client = _mock_stripe_client("https://checkout.stripe.com/pay/test")

        with override_settings(**STRIPE_SETTINGS):
            with patch("apps.billing.views.stripe.StripeClient", return_value=mock_client):
                res = trader_client.post(CHECKOUT_URL)

        assert res.status_code == 200
        assert res.data["url"] == "https://checkout.stripe.com/pay/test"

    def test_checkout_creates_stripe_customer_when_missing(self, trader_client, trader_user):
        trader_user.stripe_customer_id = ""
        trader_user.save()
        mock_client = MagicMock()
        mock_customer = MagicMock()
        mock_customer.id = "cus_newly_created"
        mock_client.customers.create.return_value = mock_customer
        mock_session = MagicMock()
        mock_session.url = "https://checkout.stripe.com/pay/new"
        mock_client.checkout.sessions.create.return_value = mock_session

        with override_settings(**STRIPE_SETTINGS):
            with patch("apps.billing.views.stripe.StripeClient", return_value=mock_client):
                res = trader_client.post(CHECKOUT_URL)

        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert trader_user.stripe_customer_id == "cus_newly_created"

    def test_mentor_cannot_create_checkout_session(self, mentor_client):
        with override_settings(**STRIPE_SETTINGS):
            res = mentor_client.post(CHECKOUT_URL)
        assert res.status_code == 403

    def test_admin_cannot_create_checkout_session(self, admin_client):
        with override_settings(**STRIPE_SETTINGS):
            res = admin_client.post(CHECKOUT_URL)
        assert res.status_code == 403

    def test_unauthenticated_cannot_create_checkout_session(self, api_client):
        res = api_client.post(CHECKOUT_URL)
        assert res.status_code in (401, 403)

    def test_returns_503_when_stripe_not_configured(self, trader_client):
        with override_settings(STRIPE_SECRET_KEY="", STRIPE_PRO_PRICE_ID=""):
            res = trader_client.post(CHECKOUT_URL)
        assert res.status_code == 503


@pytest.mark.django_db
class TestPortalSession:
    def test_trader_with_customer_id_can_open_portal(self, trader_client, trader_user):
        trader_user.stripe_customer_id = "cus_portal_test"
        trader_user.save()
        mock_client = _mock_stripe_client("https://billing.stripe.com/session/test")

        with override_settings(**STRIPE_SETTINGS):
            with patch("apps.billing.views.stripe.StripeClient", return_value=mock_client):
                res = trader_client.get(PORTAL_URL)

        assert res.status_code == 200
        assert res.data["url"] == "https://billing.stripe.com/session/test"

    def test_trader_without_customer_id_gets_400(self, trader_client, trader_user):
        trader_user.stripe_customer_id = ""
        trader_user.save()

        with override_settings(**STRIPE_SETTINGS):
            res = trader_client.get(PORTAL_URL)

        assert res.status_code == 400

    def test_unauthenticated_cannot_open_portal(self, api_client):
        res = api_client.get(PORTAL_URL)
        assert res.status_code in (401, 403)


@pytest.mark.django_db
class TestWebhook:
    def _post_webhook(self, event: dict, sig: str = "t=1,v1=abc") -> object:
        client = APIClient()
        with override_settings(**STRIPE_SETTINGS):
            with patch("apps.billing.views.stripe.Webhook.construct_event", return_value=event):
                return client.post(
                    WEBHOOK_URL,
                    data=b"{}",
                    content_type="application/json",
                    HTTP_STRIPE_SIGNATURE=sig,
                )

    def test_checkout_completed_upgrades_user_to_pro(self, trader_user):
        from apps.users.models import Plan
        trader_user.stripe_customer_id = "cus_checkout_test"
        trader_user.plan = Plan.FREE
        trader_user.save()

        event = {
            "type": "checkout.session.completed",
            "data": {"object": {"customer": "cus_checkout_test"}},
        }
        res = self._post_webhook(event)

        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert trader_user.plan == Plan.PRO

    def test_invalid_signature_returns_400(self):
        with override_settings(**STRIPE_SETTINGS):
            with patch(
                "apps.billing.views.stripe.Webhook.construct_event",
                side_effect=stripe._error.SignatureVerificationError("bad", "header"),
            ):
                client = APIClient()
                res = client.post(
                    WEBHOOK_URL,
                    data=b"{}",
                    content_type="application/json",
                    HTTP_STRIPE_SIGNATURE="invalid",
                )

        assert res.status_code == 400
        assert "Invalid signature" in res.data["error"]

    def test_subscription_deleted_downgrades_to_free(self, trader_user):
        from apps.users.models import Plan
        trader_user.stripe_customer_id = "cus_sub_del"
        trader_user.plan = Plan.PRO
        trader_user.save()

        event = {
            "type": "customer.subscription.deleted",
            "data": {"object": {"customer": "cus_sub_del"}},
        }
        res = self._post_webhook(event)

        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert trader_user.plan == Plan.FREE

    def test_subscription_updated_active_upgrades_to_pro(self, trader_user):
        from apps.users.models import Plan
        trader_user.stripe_customer_id = "cus_sub_upd"
        trader_user.plan = Plan.FREE
        trader_user.save()

        event = {
            "type": "customer.subscription.updated",
            "data": {"object": {"customer": "cus_sub_upd", "status": "active"}},
        }
        res = self._post_webhook(event)

        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert trader_user.plan == Plan.PRO

    def test_webhook_returns_503_when_not_configured(self):
        client = APIClient()
        with override_settings(STRIPE_WEBHOOK_SECRET=""):
            res = client.post(
                WEBHOOK_URL,
                data=b"{}",
                content_type="application/json",
            )
        assert res.status_code == 503
