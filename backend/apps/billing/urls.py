from django.urls import path
from . import views

urlpatterns = [
    path("create-checkout-session/", views.create_checkout_session, name="billing-checkout"),
    path("portal/", views.create_portal_session, name="billing-portal"),
    path("webhook/", views.webhook, name="billing-webhook"),
]
