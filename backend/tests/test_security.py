import pytest
from apps.users.models import CustomUser


REGISTER_URL = "/api/auth/register/"
ME_URL = "/api/users/me/"
TRADES_URL = "/api/trades/"
STATS_URL = "/api/trades/stats/"
MENTOR_REQUESTS_URL = "/api/mentors/requests/"
ADMIN_STATS_URL = "/api/admin/stats/"


XSS_PAYLOADS = [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    "javascript:alert(1)",
    '<a href="javascript:void(0)">click</a>',
]

PROTECTED_ENDPOINTS = [
    ("GET", ME_URL),
    ("GET", TRADES_URL),
    ("POST", TRADES_URL),
    ("GET", STATS_URL),
    ("GET", MENTOR_REQUESTS_URL),
    ("GET", ADMIN_STATS_URL),
]


@pytest.mark.django_db
class TestXssProtection:
    def test_xss_script_tag_stripped_on_register(self, api_client):
        res = api_client.post(REGISTER_URL, {
            "email": "xss@test.com",
            "display_name": "<script>alert('XSS')</script>",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "role": "trader",
        }, format="json")
        # Registration succeeds (inner text "alert('XSS')" is > 2 chars)
        assert res.status_code == 201
        user = CustomUser.objects.get(email="xss@test.com")
        assert "<script>" not in user.display_name
        assert "</script>" not in user.display_name

    def test_img_onerror_tag_stripped_on_register(self, api_client):
        res = api_client.post(REGISTER_URL, {
            "email": "xss2@test.com",
            "display_name": "<img src=x onerror=alert(1)>Valid",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "role": "trader",
        }, format="json")
        assert res.status_code == 201
        user = CustomUser.objects.get(email="xss2@test.com")
        assert "<img" not in user.display_name
        assert "onerror" not in user.display_name

    def test_javascript_uri_stripped_on_profile_update(self, trader_client, trader_user):
        res = trader_client.patch(ME_URL, {"display_name": "javascript:alert(1)"}, format="json")
        # "javascript:alert(1)" → sanitized to "alert(1)" (javascript: removed)
        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert "javascript:" not in trader_user.display_name

    def test_inline_event_handler_stripped_on_profile_update(self, trader_client, trader_user):
        res = trader_client.patch(ME_URL, {"display_name": "onclick=evil() Trader"}, format="json")
        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert "onclick=" not in trader_user.display_name

    def test_empty_after_sanitization_rejected(self, api_client):
        # "<b></b>" → strip_tags → "" → len 0 → 400
        res = api_client.post(REGISTER_URL, {
            "email": "empty@test.com",
            "display_name": "<b></b>",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "role": "trader",
        }, format="json")
        assert res.status_code == 400

    def test_display_name_too_long_rejected(self, api_client):
        res = api_client.post(REGISTER_URL, {
            "email": "long@test.com",
            "display_name": "A" * 51,
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "role": "trader",
        }, format="json")
        assert res.status_code == 400


@pytest.mark.django_db
class TestUnauthenticatedAccess:
    @pytest.mark.parametrize("method,url", PROTECTED_ENDPOINTS)
    def test_unauthenticated_blocked(self, api_client, method, url):
        response = getattr(api_client, method.lower())(url)
        assert response.status_code in (401, 403), (
            f"{method} {url} returned {response.status_code} — expected 401 or 403"
        )

    def test_unauthenticated_cannot_read_me(self, api_client):
        res = api_client.get(ME_URL)
        assert res.status_code in (401, 403)

    def test_unauthenticated_cannot_read_trades(self, api_client):
        res = api_client.get(TRADES_URL)
        assert res.status_code in (401, 403)
