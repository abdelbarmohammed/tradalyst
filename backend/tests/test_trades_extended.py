import io
import pytest
from decimal import Decimal
from datetime import timedelta
from unittest.mock import patch
from django.utils import timezone

from apps.trades.models import Trade, Direction, TradeResult, Emotion

TRADES_URL = "/api/trades/"
IMPORT_URL = "/api/trades/import/"
STATS_URL = "/api/trades/stats/"

VALID_CSV = (
    b"date,pair,direction,entry_price,exit_price,quantity,result,emotion,notes\n"
    b"2026-01-15,BTC/USDT,long,95000,97000,0.1,win,confident,Test trade\n"
)

VALID_CSV_2_ROWS = (
    b"date,pair,direction,entry_price,exit_price,quantity,result,emotion,notes\n"
    b"2026-01-15,BTC/USDT,long,95000,97000,0.1,win,confident,Row one\n"
    b"2026-01-16,ETH/USDT,short,3000,2800,1,win,calm,Row two\n"
)


def _csv_file(content: bytes, name: str = "trades.csv"):
    f = io.BytesIO(content)
    f.name = name
    return f


@pytest.mark.django_db
class TestCSVImport:
    def test_valid_csv_imports_trades(self, trader_client, trader_user):
        res = trader_client.post(
            IMPORT_URL,
            {"file": _csv_file(VALID_CSV)},
            format="multipart",
        )
        assert res.status_code == 200
        assert res.data["imported"] == 1
        assert res.data["skipped"] == 0
        assert Trade.objects.filter(user=trader_user).count() == 1

    def test_imported_trade_has_correct_fields(self, trader_client, trader_user):
        trader_client.post(IMPORT_URL, {"file": _csv_file(VALID_CSV)}, format="multipart")
        trade = Trade.objects.get(user=trader_user)
        assert trade.pair == "BTC/USDT"
        assert trade.direction == Direction.LONG
        assert trade.entry_price == Decimal("95000")
        assert trade.exit_price == Decimal("97000")
        assert trade.pnl == Decimal("200.00000000")

    def test_multiple_valid_rows_all_imported(self, trader_client, trader_user):
        res = trader_client.post(
            IMPORT_URL,
            {"file": _csv_file(VALID_CSV_2_ROWS)},
            format="multipart",
        )
        assert res.data["imported"] == 2
        assert Trade.objects.filter(user=trader_user).count() == 2

    def test_file_too_large_returns_400(self, trader_client):
        with patch("apps.trades.views.CSV_IMPORT_MAX_SIZE_BYTES", 10):
            res = trader_client.post(
                IMPORT_URL,
                {"file": _csv_file(VALID_CSV)},
                format="multipart",
            )
        assert res.status_code == 400
        assert "grande" in res.data["detail"]

    def test_missing_file_returns_400(self, trader_client):
        res = trader_client.post(IMPORT_URL, {}, format="multipart")
        assert res.status_code == 400

    def test_invalid_headers_skips_all_rows(self, trader_client):
        bad_csv = b"wrong,columns,here\nsome,data,here\n"
        res = trader_client.post(
            IMPORT_URL,
            {"file": _csv_file(bad_csv)},
            format="multipart",
        )
        assert res.status_code == 200
        assert res.data["imported"] == 0
        assert res.data["skipped"] > 0

    def test_partial_success_valid_and_invalid_rows(self, trader_client, trader_user):
        csv_content = (
            b"date,pair,direction,entry_price,exit_price,quantity,result\n"
            b"2026-01-15,BTC/USDT,long,95000,97000,0.1,win\n"
            b"bad_date,ETH/USDT,long,not_a_price,,0.1,\n"
        )
        res = trader_client.post(
            IMPORT_URL,
            {"file": _csv_file(csv_content)},
            format="multipart",
        )
        assert res.status_code == 200
        assert res.data["imported"] == 1
        assert res.data["skipped"] == 1
        assert len(res.data["errors"]) == 1

    def test_mentor_cannot_import(self, mentor_client):
        res = mentor_client.post(
            IMPORT_URL,
            {"file": _csv_file(VALID_CSV)},
            format="multipart",
        )
        assert res.status_code == 403

    def test_unauthenticated_cannot_import(self, api_client):
        res = api_client.post(
            IMPORT_URL,
            {"file": _csv_file(VALID_CSV)},
            format="multipart",
        )
        assert res.status_code in (401, 403)


@pytest.mark.django_db
class TestTradeFiltering:
    def _create_trade(self, user, direction=Direction.LONG, result=TradeResult.WIN,
                      emotion=Emotion.CALM, pair="BTC/USD"):
        return Trade.objects.create(
            user=user,
            pair=pair,
            direction=direction,
            entry_price=Decimal("50000"),
            exit_price=Decimal("51000"),
            quantity=Decimal("0.1"),
            entry_time=timezone.now(),
            result=result,
            emotion=emotion,
        )

    def test_filter_by_direction_long(self, trader_client, trader_user):
        self._create_trade(trader_user, direction=Direction.LONG)
        self._create_trade(trader_user, direction=Direction.SHORT)
        res = trader_client.get(TRADES_URL + "?direction=long")
        assert res.data["count"] == 1
        assert res.data["results"][0]["direction"] == "long"

    def test_filter_by_result_win(self, trader_client, trader_user):
        self._create_trade(trader_user, result=TradeResult.WIN)
        self._create_trade(trader_user, result=TradeResult.LOSS)
        res = trader_client.get(TRADES_URL + "?result=win")
        assert res.data["count"] == 1
        assert res.data["results"][0]["result"] == "win"

    def test_filter_by_emotion_fomo(self, trader_client, trader_user):
        self._create_trade(trader_user, emotion=Emotion.FOMO)
        self._create_trade(trader_user, emotion=Emotion.CALM)
        res = trader_client.get(TRADES_URL + "?emotion=fomo")
        assert res.data["count"] == 1
        assert res.data["results"][0]["emotion"] == "fomo"

    def test_filter_by_pair_partial_match(self, trader_client, trader_user):
        self._create_trade(trader_user, pair="BTC/USD")
        self._create_trade(trader_user, pair="ETH/USD")
        res = trader_client.get(TRADES_URL + "?pair=BTC")
        assert res.data["count"] == 1
        assert res.data["results"][0]["pair"] == "BTC/USD"

    def test_multiple_filters_combined(self, trader_client, trader_user):
        self._create_trade(trader_user, direction=Direction.LONG, result=TradeResult.WIN)
        self._create_trade(trader_user, direction=Direction.SHORT, result=TradeResult.WIN)
        self._create_trade(trader_user, direction=Direction.LONG, result=TradeResult.LOSS)
        res = trader_client.get(TRADES_URL + "?direction=long&result=win")
        assert res.data["count"] == 1

    def test_filter_by_date_range(self, trader_client, trader_user):
        now = timezone.now()
        old_time = now - timedelta(days=30)
        Trade.objects.create(
            user=trader_user, pair="BTC/USD", direction=Direction.LONG,
            entry_price=Decimal("50000"), quantity=Decimal("0.1"),
            entry_time=old_time,
        )
        Trade.objects.create(
            user=trader_user, pair="ETH/USD", direction=Direction.LONG,
            entry_price=Decimal("3000"), quantity=Decimal("1"),
            entry_time=now,
        )
        today = now.date().isoformat()
        res = trader_client.get(TRADES_URL + f"?entry_time_after={today}")
        assert res.data["count"] == 1
        assert res.data["results"][0]["pair"] == "ETH/USD"


@pytest.mark.django_db
class TestTradeStatsDateFilter:
    def _create_trade_at(self, user, dt, result=TradeResult.WIN):
        return Trade.objects.create(
            user=user,
            pair="BTC/USD",
            direction=Direction.LONG,
            entry_price=Decimal("50000"),
            exit_price=Decimal("51000"),
            quantity=Decimal("0.1"),
            entry_time=dt,
            result=result,
        )

    def test_stats_without_filter_includes_all_trades(self, trader_client, trader_user):
        now = timezone.now()
        self._create_trade_at(trader_user, now)
        self._create_trade_at(trader_user, now - timedelta(days=10))
        res = trader_client.get(STATS_URL)
        assert res.data["total_trades"] == 2

    def test_stats_with_date_filter_limits_results(self, trader_client, trader_user):
        now = timezone.now()
        self._create_trade_at(trader_user, now)
        self._create_trade_at(trader_user, now - timedelta(days=10))
        today = now.date().isoformat()
        res = trader_client.get(STATS_URL + f"?entry_time_after={today}")
        assert res.data["total_trades"] == 1

    def test_stats_date_range_returns_correct_subset(self, trader_client, trader_user):
        now = timezone.now()
        self._create_trade_at(trader_user, now - timedelta(days=1))
        self._create_trade_at(trader_user, now - timedelta(days=5))
        self._create_trade_at(trader_user, now - timedelta(days=15))
        date_from = (now - timedelta(days=6)).date().isoformat()
        date_to = now.date().isoformat()
        res = trader_client.get(STATS_URL + f"?entry_time_after={date_from}&entry_time_before={date_to}")
        assert res.data["total_trades"] == 2
