import pytest
from django.utils import timezone
from apps.users.models import CustomUser, Role


REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/login/"
LOGOUT_URL = "/api/auth/logout/"


VALID_TRADER_PAYLOAD = {
    "email": "newtrader@test.com",
    "display_name": "New Trader",
    "password": "StrongPass123!",
    "password_confirm": "StrongPass123!",
    "role": "trader",
}

VALID_MENTOR_PAYLOAD = {
    "email": "newmentor@test.com",
    "display_name": "New Mentor",
    "password": "StrongPass123!",
    "password_confirm": "StrongPass123!",
    "role": "mentor",
}


@pytest.mark.django_db
class TestRegister:
    def test_register_trader_success(self, api_client):
        res = api_client.post(REGISTER_URL, VALID_TRADER_PAYLOAD, format="json")
        assert res.status_code == 201
        assert res.data["email"] == "newtrader@test.com"
        assert "access_token" in res.cookies
        assert "refresh_token" in res.cookies
        assert res.cookies["access_token"]["httponly"]
        assert res.cookies["refresh_token"]["httponly"]

    def test_register_mentor_success(self, api_client):
        res = api_client.post(REGISTER_URL, VALID_MENTOR_PAYLOAD, format="json")
        assert res.status_code == 201
        assert CustomUser.objects.get(email="newmentor@test.com").role == Role.MENTOR

    def test_register_admin_role_blocked(self, api_client):
        payload = {**VALID_TRADER_PAYLOAD, "email": "badactor@test.com", "role": "admin"}
        res = api_client.post(REGISTER_URL, payload, format="json")
        assert res.status_code == 400

    def test_register_duplicate_email(self, api_client, trader_user):
        payload = {**VALID_TRADER_PAYLOAD, "email": trader_user.email}
        res = api_client.post(REGISTER_URL, payload, format="json")
        assert res.status_code == 400

    def test_register_password_mismatch(self, api_client):
        payload = {**VALID_TRADER_PAYLOAD, "password_confirm": "DifferentPass456!"}
        res = api_client.post(REGISTER_URL, payload, format="json")
        assert res.status_code == 400

    def test_register_xss_display_name_sanitized(self, api_client):
        payload = {
            **VALID_TRADER_PAYLOAD,
            "display_name": "<script>alert('XSS')</script>",
        }
        res = api_client.post(REGISTER_URL, payload, format="json")
        # Script tags stripped — inner text kept (length > 2, so registration succeeds)
        assert res.status_code == 201
        user = CustomUser.objects.get(email=VALID_TRADER_PAYLOAD["email"])
        assert "<script>" not in user.display_name
        assert "alert" in user.display_name  # inner text preserved

    def test_register_xss_tags_only_rejected(self, api_client):
        # Tags with no inner text → sanitized to "" → len < 2 → 400
        payload = {**VALID_TRADER_PAYLOAD, "display_name": "<b></b>"}
        res = api_client.post(REGISTER_URL, payload, format="json")
        assert res.status_code == 400

    def test_register_missing_email(self, api_client):
        payload = {k: v for k, v in VALID_TRADER_PAYLOAD.items() if k != "email"}
        res = api_client.post(REGISTER_URL, payload, format="json")
        assert res.status_code == 400

    def test_register_weak_password(self, api_client):
        payload = {**VALID_TRADER_PAYLOAD, "password": "123", "password_confirm": "123"}
        res = api_client.post(REGISTER_URL, payload, format="json")
        assert res.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client, trader_user):
        res = api_client.post(LOGIN_URL, {"email": "trader@test.com", "password": "TestPass123!"}, format="json")
        assert res.status_code == 200
        assert res.data["email"] == "trader@test.com"
        assert "access_token" in res.cookies
        assert "refresh_token" in res.cookies

    def test_login_wrong_password(self, api_client, trader_user):
        res = api_client.post(LOGIN_URL, {"email": "trader@test.com", "password": "Wrong!"}, format="json")
        assert res.status_code == 401

    def test_login_nonexistent_user(self, api_client):
        res = api_client.post(LOGIN_URL, {"email": "ghost@test.com", "password": "Whatever!"}, format="json")
        assert res.status_code == 401

    def test_login_suspended_user(self, api_client, trader_user):
        trader_user.is_active = False
        trader_user.save(update_fields=["is_active"])
        res = api_client.post(LOGIN_URL, {"email": "trader@test.com", "password": "TestPass123!"}, format="json")
        assert res.status_code == 401


@pytest.mark.django_db
class TestLogout:
    def test_logout_clears_cookies(self, api_client, trader_user):
        # Log in first
        api_client.post(LOGIN_URL, {"email": "trader@test.com", "password": "TestPass123!"}, format="json")
        res = api_client.post(LOGOUT_URL)
        assert res.status_code == 200
        # Cookies should be cleared (max_age=0 or empty value)
        assert res.data["detail"] == "Logged out."

    def test_logout_unauthenticated_still_ok(self, api_client):
        # Logout without cookies should not crash
        res = api_client.post(LOGOUT_URL)
        assert res.status_code == 200
