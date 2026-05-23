import pytest
from decimal import Decimal
from django.utils import timezone
from rest_framework.test import APIClient

from apps.users.models import CustomUser, Role
from apps.trades.models import Trade, Direction, TradeResult


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def trader_user(db):
    return CustomUser.objects.create_user(
        email="trader@test.com",
        password="TestPass123!",
        display_name="Test Trader",
        role=Role.TRADER,
    )


@pytest.fixture
def mentor_user(db):
    return CustomUser.objects.create_user(
        email="mentor@test.com",
        password="TestPass123!",
        display_name="Test Mentor",
        role=Role.MENTOR,
    )


@pytest.fixture
def admin_user(db):
    return CustomUser.objects.create_user(
        email="admin@test.com",
        password="TestPass123!",
        display_name="Test Admin",
        role=Role.ADMIN,
    )


@pytest.fixture
def trader_client(api_client, trader_user):
    api_client.force_authenticate(user=trader_user)
    return api_client


@pytest.fixture
def mentor_client(api_client, mentor_user):
    api_client.force_authenticate(user=mentor_user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def sample_trade(db, trader_user):
    return Trade.objects.create(
        user=trader_user,
        pair="BTC/USD",
        direction=Direction.LONG,
        entry_price=Decimal("50000.00000000"),
        exit_price=Decimal("52000.00000000"),
        quantity=Decimal("0.10000000"),
        entry_time=timezone.now(),
        result=TradeResult.WIN,
    )
