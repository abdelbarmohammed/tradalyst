import pytest
from decimal import Decimal
from django.utils import timezone
from apps.trades.models import Trade, Direction, TradeResult


TRADES_URL = "/api/trades/"
STATS_URL = "/api/trades/stats/"


def trade_url(pk: int) -> str:
    return f"/api/trades/{pk}/"


VALID_TRADE_PAYLOAD = {
    "pair": "ETH/USD",
    "direction": "long",
    "entry_price": "3000.00000000",
    "exit_price": "3300.00000000",
    "quantity": "1.00000000",
    "entry_time": "2026-01-15T10:00:00Z",
    "exit_time": "2026-01-15T14:00:00Z",
    "result": "win",
}


@pytest.mark.django_db
class TestTradeList:
    def test_list_own_trades(self, trader_client, sample_trade):
        res = trader_client.get(TRADES_URL)
        assert res.status_code == 200
        assert res.data["count"] == 1
        assert res.data["results"][0]["pair"] == "BTC/USD"

    def test_list_excludes_other_user_trades(self, trader_client, db):
        from apps.users.models import CustomUser, Role
        other = CustomUser.objects.create_user(
            email="other@test.com", password="Pass123!", display_name="Other", role=Role.TRADER
        )
        Trade.objects.create(
            user=other, pair="XRP/USD", direction=Direction.LONG,
            entry_price="1.00", quantity="100", entry_time=timezone.now(),
        )
        res = trader_client.get(TRADES_URL)
        assert res.status_code == 200
        assert res.data["count"] == 0

    def test_unauthenticated_blocked(self, api_client):
        res = api_client.get(TRADES_URL)
        assert res.status_code in (401, 403)


@pytest.mark.django_db
class TestTradeCreate:
    def test_create_trade_success(self, trader_client):
        res = trader_client.post(TRADES_URL, VALID_TRADE_PAYLOAD, format="json")
        assert res.status_code == 201
        assert res.data["pair"] == "ETH/USD"

    def test_pnl_auto_calculated_long(self, trader_client):
        payload = {**VALID_TRADE_PAYLOAD, "entry_price": "3000.00", "exit_price": "3300.00", "quantity": "1.00"}
        res = trader_client.post(TRADES_URL, payload, format="json")
        assert res.status_code == 201
        trade = Trade.objects.get(pk=res.data["id"])
        # LONG: (exit - entry) * qty = (3300 - 3000) * 1 = 300
        assert Decimal(trade.pnl) == Decimal("300.00000000")

    def test_pnl_auto_calculated_short(self, trader_client):
        payload = {
            **VALID_TRADE_PAYLOAD,
            "direction": "short",
            "entry_price": "3300.00",
            "exit_price": "3000.00",
            "quantity": "1.00",
        }
        res = trader_client.post(TRADES_URL, payload, format="json")
        assert res.status_code == 201
        trade = Trade.objects.get(pk=res.data["id"])
        # SHORT: (entry - exit) * qty = (3300 - 3000) * 1 = 300
        assert Decimal(trade.pnl) == Decimal("300.00000000")

    def test_pnl_null_when_no_exit_price(self, trader_client):
        payload = {k: v for k, v in VALID_TRADE_PAYLOAD.items() if k not in ("exit_price", "exit_time")}
        res = trader_client.post(TRADES_URL, payload, format="json")
        assert res.status_code == 201
        trade = Trade.objects.get(pk=res.data["id"])
        assert trade.pnl is None

    def test_create_missing_required_fields(self, trader_client):
        res = trader_client.post(TRADES_URL, {"pair": "BTC/USD"}, format="json")
        assert res.status_code == 400

    def test_admin_cannot_create_trade(self, admin_client):
        res = admin_client.post(TRADES_URL, VALID_TRADE_PAYLOAD, format="json")
        assert res.status_code == 403


@pytest.mark.django_db
class TestTradeDetail:
    def test_read_own_trade(self, trader_client, sample_trade):
        res = trader_client.get(trade_url(sample_trade.pk))
        assert res.status_code == 200
        assert res.data["id"] == sample_trade.pk

    def test_read_other_users_trade_returns_404(self, db):
        from apps.users.models import CustomUser, Role
        from rest_framework.test import APIClient
        other = CustomUser.objects.create_user(
            email="other2@test.com", password="Pass123!", display_name="Other2", role=Role.TRADER
        )
        trade = Trade.objects.create(
            user=other, pair="ETH/USD", direction=Direction.LONG,
            entry_price="3000", quantity="1", entry_time=timezone.now(),
        )
        requester = CustomUser.objects.create_user(
            email="requester@test.com", password="Pass123!", display_name="Req", role=Role.TRADER
        )
        client = APIClient()
        client.force_authenticate(user=requester)
        res = client.get(trade_url(trade.pk))
        assert res.status_code == 404

    def test_update_own_trade(self, trader_client, sample_trade):
        res = trader_client.patch(trade_url(sample_trade.pk), {"notes": "Updated note"}, format="json")
        assert res.status_code == 200
        assert res.data["notes"] == "Updated note"

    def test_delete_own_trade(self, trader_client, sample_trade):
        res = trader_client.delete(trade_url(sample_trade.pk))
        assert res.status_code == 204
        assert not Trade.objects.filter(pk=sample_trade.pk).exists()

    def test_delete_other_users_trade_returns_404(self, db):
        from apps.users.models import CustomUser, Role
        from rest_framework.test import APIClient
        owner = CustomUser.objects.create_user(
            email="owner@test.com", password="Pass123!", display_name="Owner", role=Role.TRADER
        )
        trade = Trade.objects.create(
            user=owner, pair="BTC/USD", direction=Direction.LONG,
            entry_price="50000", quantity="0.1", entry_time=timezone.now(),
        )
        attacker = CustomUser.objects.create_user(
            email="attacker@test.com", password="Pass123!", display_name="Att", role=Role.TRADER
        )
        client = APIClient()
        client.force_authenticate(user=attacker)
        res = client.delete(trade_url(trade.pk))
        assert res.status_code == 404


@pytest.mark.django_db
class TestTradeStats:
    def test_stats_endpoint_returns_expected_fields(self, trader_client, sample_trade):
        res = trader_client.get(STATS_URL)
        assert res.status_code == 200
        for field in ("total_trades", "winning_trades", "losing_trades", "win_rate", "total_pnl"):
            assert field in res.data

    def test_stats_accuracy(self, trader_client, trader_user):
        # Two wins, one loss
        for entry, exit_, result in [
            (Decimal("1000"), Decimal("1100"), "win"),
            (Decimal("1000"), Decimal("1100"), "win"),
            (Decimal("1000"), Decimal("900"),  "loss"),
        ]:
            Trade.objects.create(
                user=trader_user, pair="BTC/USD", direction=Direction.LONG,
                entry_price=entry, exit_price=exit_, quantity=Decimal("1"),
                entry_time=timezone.now(), result=result,
            )
        res = trader_client.get(STATS_URL)
        assert res.status_code == 200
        assert res.data["total_trades"] == 3
        assert res.data["winning_trades"] == 2
        assert res.data["losing_trades"] == 1
        # win_rate = 2/3 * 100 ≈ 66.67
        assert float(res.data["win_rate"]) == pytest.approx(66.67, rel=0.01)

    def test_stats_empty(self, trader_client):
        res = trader_client.get(STATS_URL)
        assert res.status_code == 200
        assert res.data["total_trades"] == 0
