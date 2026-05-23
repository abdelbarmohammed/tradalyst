import pytest
from apps.users.models import CustomUser


ME_URL = "/api/users/me/"
ADMIN_USERS_URL = "/api/users/"


@pytest.mark.django_db
class TestUserProfile:
    def test_get_own_profile(self, trader_client, trader_user):
        res = trader_client.get(ME_URL)
        assert res.status_code == 200
        assert res.data["email"] == trader_user.email
        assert res.data["display_name"] == trader_user.display_name
        assert res.data["role"] == "trader"

    def test_get_profile_unauthenticated(self, api_client):
        res = api_client.get(ME_URL)
        assert res.status_code in (401, 403)

    def test_update_display_name(self, trader_client, trader_user):
        res = trader_client.patch(ME_URL, {"display_name": "Updated Name"}, format="json")
        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert trader_user.display_name == "Updated Name"

    def test_update_language_preference(self, trader_client, trader_user):
        res = trader_client.patch(ME_URL, {"language_preference": "en"}, format="json")
        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert trader_user.language_preference == "en"

    def test_cannot_change_own_role(self, trader_client, trader_user):
        res = trader_client.patch(ME_URL, {"role": "admin"}, format="json")
        # role is read-only in UserProfileSerializer
        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert trader_user.role == "trader"

    def test_cannot_change_own_email(self, trader_client, trader_user):
        original_email = trader_user.email
        res = trader_client.patch(ME_URL, {"email": "changed@test.com"}, format="json")
        assert res.status_code == 200
        trader_user.refresh_from_db()
        assert trader_user.email == original_email

    def test_display_name_min_length_enforced(self, trader_client):
        res = trader_client.patch(ME_URL, {"display_name": "X"}, format="json")
        assert res.status_code == 400

    def test_display_name_max_length_enforced(self, trader_client):
        res = trader_client.patch(ME_URL, {"display_name": "A" * 51}, format="json")
        assert res.status_code == 400


@pytest.mark.django_db
class TestAdminUserList:
    def test_admin_lists_all_users(self, admin_client, trader_user, mentor_user):
        res = admin_client.get(ADMIN_USERS_URL)
        assert res.status_code == 200
        emails = [u["email"] for u in res.data["results"]]
        assert trader_user.email in emails
        assert mentor_user.email in emails

    def test_admin_filters_by_role(self, admin_client, trader_user, mentor_user):
        res = admin_client.get(ADMIN_USERS_URL + "?role=mentor")
        assert res.status_code == 200
        for u in res.data["results"]:
            assert u["role"] == "mentor"

    def test_trader_cannot_list_all_users(self, trader_client):
        res = trader_client.get(ADMIN_USERS_URL)
        assert res.status_code == 403

    def test_mentor_cannot_list_all_users(self, mentor_client):
        res = mentor_client.get(ADMIN_USERS_URL)
        assert res.status_code == 403
