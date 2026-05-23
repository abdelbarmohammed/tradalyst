import pytest


TRADES_URL = "/api/trades/"
STATS_URL = "/api/trades/stats/"
MENTOR_REQUESTS_URL = "/api/mentors/requests/"
MENTOR_TRADERS_URL = "/api/mentors/my-traders/"
ADMIN_USERS_URL = "/api/users/"
ADMIN_STATS_URL = "/api/admin/stats/"

VALID_TRADE_PAYLOAD = {
    "pair": "BTC/USD",
    "direction": "long",
    "entry_price": "50000.00",
    "quantity": "0.1",
    "entry_time": "2026-01-15T10:00:00Z",
}


@pytest.mark.django_db
class TestTraderRoleIsolation:
    def test_trader_cannot_access_my_traders(self, trader_client):
        res = trader_client.get(MENTOR_TRADERS_URL)
        assert res.status_code == 403

    def test_trader_cannot_access_admin_user_list(self, trader_client):
        res = trader_client.get(ADMIN_USERS_URL)
        assert res.status_code == 403

    def test_trader_cannot_access_admin_stats(self, trader_client):
        res = trader_client.get(ADMIN_STATS_URL)
        assert res.status_code == 403


@pytest.mark.django_db
class TestMentorRoleIsolation:
    def test_mentor_can_create_trades(self, mentor_client):
        # TradeListCreateView uses IsTraderOrMentor — mentors can log their own trades
        res = mentor_client.post(TRADES_URL, VALID_TRADE_PAYLOAD, format="json")
        assert res.status_code == 201

    def test_mentor_can_list_own_trades(self, mentor_client):
        res = mentor_client.get(TRADES_URL)
        assert res.status_code == 200

    def test_mentor_cannot_access_admin_user_list(self, mentor_client):
        res = mentor_client.get(ADMIN_USERS_URL)
        assert res.status_code == 403

    def test_mentor_cannot_access_admin_stats(self, mentor_client):
        res = mentor_client.get(ADMIN_STATS_URL)
        assert res.status_code == 403

    def test_mentor_cannot_import_csv(self, mentor_client):
        # TradeCSVImportView uses IsTrader (not IsTraderOrMentor)
        res = mentor_client.post("/api/trades/import/", {}, format="multipart")
        assert res.status_code == 403


@pytest.mark.django_db
class TestAdminRoleIsolation:
    def test_admin_cannot_create_trades(self, admin_client):
        res = admin_client.post(TRADES_URL, VALID_TRADE_PAYLOAD, format="json")
        assert res.status_code == 403

    def test_admin_cannot_list_trades(self, admin_client):
        res = admin_client.get(TRADES_URL)
        assert res.status_code == 403

    def test_admin_cannot_send_mentor_request(self, admin_client):
        res = admin_client.post(MENTOR_REQUESTS_URL, {"trader_email": "t@test.com"}, format="json")
        assert res.status_code == 403

    def test_admin_can_access_user_list(self, admin_client):
        res = admin_client.get(ADMIN_USERS_URL)
        assert res.status_code == 200

    def test_admin_can_access_stats(self, admin_client):
        res = admin_client.get(ADMIN_STATS_URL)
        assert res.status_code == 200
