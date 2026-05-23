import pytest
from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import override_settings
from django.utils import timezone

from apps.trades.models import Trade, Direction, TradeResult

INSIGHTS_URL = "/api/analysis/insights/"
GENERATE_URL = "/api/analysis/insights/generate/"
CHAT_URL = "/api/analysis/chat/"
CHAT_SEND_URL = "/api/analysis/chat/send/"

CLAUDE_SETTINGS = {"CLAUDE_API_KEY": "test-claude-key"}


def _mock_anthropic(text: str = "Mock AI response.") -> MagicMock:
    """Return a patched Anthropic class whose messages.create returns `text`."""
    mock_cls = MagicMock()
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=text)]
    mock_cls.return_value.messages.create.return_value = mock_response
    return mock_cls


def _create_trades(user, count: int = 5) -> None:
    for i in range(count):
        Trade.objects.create(
            user=user,
            pair="BTC/USD",
            direction=Direction.LONG,
            entry_price=Decimal("50000"),
            exit_price=Decimal("51000"),
            quantity=Decimal("0.1"),
            entry_time=timezone.now(),
            result=TradeResult.WIN,
        )


@pytest.mark.django_db
class TestInsightList:
    def test_authenticated_trader_gets_insight_list(self, trader_client):
        res = trader_client.get(INSIGHTS_URL)
        assert res.status_code == 200

    def test_unauthenticated_blocked(self, api_client):
        res = api_client.get(INSIGHTS_URL)
        assert res.status_code in (401, 403)

    def test_empty_list_for_new_trader(self, trader_client):
        res = trader_client.get(INSIGHTS_URL)
        assert res.status_code == 200
        assert res.data["results"] == []

    def test_insight_appears_in_list_after_creation(self, trader_client, trader_user):
        from apps.analysis.models import AiInsight
        from datetime import date
        AiInsight.objects.create(
            user=trader_user,
            content="Test insight content.",
            period_start=date.today(),
            period_end=date.today(),
            trade_count=5,
        )
        res = trader_client.get(INSIGHTS_URL)
        assert res.data["count"] == 1
        assert res.data["results"][0]["content"] == "Test insight content."


@pytest.mark.django_db
class TestInsightGenerate:
    @override_settings(**CLAUDE_SETTINGS)
    def test_fewer_than_min_trades_returns_400(self, trader_client):
        with patch("anthropic.Anthropic"):
            res = trader_client.post(GENERATE_URL)
        assert res.status_code == 400
        assert "trades" in res.data["detail"].lower()

    @override_settings(**CLAUDE_SETTINGS)
    def test_trader_with_enough_trades_gets_insight(self, trader_client, trader_user):
        _create_trades(trader_user, count=5)
        mock_cls = _mock_anthropic("Your weekly insight: great discipline this week.")

        with patch("anthropic.Anthropic", mock_cls):
            res = trader_client.post(GENERATE_URL)

        assert res.status_code == 201
        assert res.data["content"] == "Your weekly insight: great discipline this week."
        assert res.data["trade_count"] == 5

    @override_settings(**CLAUDE_SETTINGS)
    def test_insight_is_persisted_in_database(self, trader_client, trader_user):
        from apps.analysis.models import AiInsight
        _create_trades(trader_user, count=5)

        with patch("anthropic.Anthropic", _mock_anthropic("Persisted insight.")):
            trader_client.post(GENERATE_URL)

        assert AiInsight.objects.filter(user=trader_user).count() == 1

    def test_unauthenticated_cannot_generate_insight(self, api_client):
        res = api_client.post(GENERATE_URL)
        assert res.status_code in (401, 403)


@pytest.mark.django_db
class TestChatHistory:
    def test_authenticated_trader_gets_chat_history(self, trader_client):
        res = trader_client.get(CHAT_URL)
        assert res.status_code == 200

    def test_unauthenticated_blocked(self, api_client):
        res = api_client.get(CHAT_URL)
        assert res.status_code in (401, 403)

    def test_chat_messages_stored_and_returned(self, trader_client, trader_user):
        from apps.analysis.models import ChatMessage
        ChatMessage.objects.create(user=trader_user, role=ChatMessage.MessageRole.USER, content="Hello")
        ChatMessage.objects.create(user=trader_user, role=ChatMessage.MessageRole.ASSISTANT, content="Hi there")

        res = trader_client.get(CHAT_URL)
        assert res.data["count"] == 2


@pytest.mark.django_db
class TestChatSend:
    @override_settings(**CLAUDE_SETTINGS)
    def test_trader_sends_message_and_gets_response(self, trader_client):
        mock_cls = _mock_anthropic("You're doing great!")

        with patch("anthropic.Anthropic", mock_cls):
            res = trader_client.post(CHAT_SEND_URL, {"message": "How am I doing?"}, format="json")

        assert res.status_code == 201
        assert res.data["content"] == "You're doing great!"
        assert res.data["role"] == "assistant"

    @override_settings(**CLAUDE_SETTINGS)
    def test_both_user_and_assistant_messages_stored(self, trader_client, trader_user):
        from apps.analysis.models import ChatMessage

        with patch("anthropic.Anthropic", _mock_anthropic("Response stored.")):
            trader_client.post(CHAT_SEND_URL, {"message": "Store this please."}, format="json")

        messages = ChatMessage.objects.filter(user=trader_user).order_by("created_at")
        assert messages.count() == 2
        assert messages[0].role == ChatMessage.MessageRole.USER
        assert messages[0].content == "Store this please."
        assert messages[1].role == ChatMessage.MessageRole.ASSISTANT
        assert messages[1].content == "Response stored."

    def test_empty_message_returns_400(self, trader_client):
        res = trader_client.post(CHAT_SEND_URL, {"message": ""}, format="json")
        assert res.status_code == 400

    def test_unauthenticated_cannot_send_chat(self, api_client):
        res = api_client.post(CHAT_SEND_URL, {"message": "Hi"}, format="json")
        assert res.status_code in (401, 403)


@pytest.mark.django_db
class TestClaudeServiceUnit:
    @override_settings(**CLAUDE_SETTINGS)
    def test_english_language_preference_uses_english_prompt(self, trader_user):
        from apps.analysis.services.claude import ClaudeService
        trader_user.language_preference = "en"
        trader_user.save()
        _create_trades(trader_user, count=5)

        mock_cls = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="English insight.")]
        mock_client = mock_cls.return_value
        mock_client.messages.create.return_value = mock_response

        with patch("anthropic.Anthropic", mock_cls):
            ClaudeService().generate_weekly_insight(trader_user)

        call_kwargs = mock_client.messages.create.call_args.kwargs
        assert "Respond in English." in call_kwargs["system"]

    @override_settings(**CLAUDE_SETTINGS)
    def test_spanish_language_preference_uses_spanish_prompt(self, trader_user):
        from apps.analysis.services.claude import ClaudeService
        trader_user.language_preference = "es"
        trader_user.save()
        _create_trades(trader_user, count=5)

        mock_cls = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Spanish insight.")]
        mock_client = mock_cls.return_value
        mock_client.messages.create.return_value = mock_response

        with patch("anthropic.Anthropic", mock_cls):
            ClaudeService().generate_weekly_insight(trader_user)

        call_kwargs = mock_client.messages.create.call_args.kwargs
        assert "Responde en español." in call_kwargs["system"]

    @override_settings(CLAUDE_API_KEY="")
    def test_missing_api_key_raises_value_error(self):
        from apps.analysis.services.claude import ClaudeService
        with pytest.raises(ValueError, match="CLAUDE_API_KEY"):
            ClaudeService()

    @override_settings(**CLAUDE_SETTINGS)
    def test_chat_includes_trade_context_in_system_prompt(self, trader_user):
        from apps.analysis.services.claude import ClaudeService
        _create_trades(trader_user, count=2)

        mock_cls = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Chat reply.")]
        mock_client = mock_cls.return_value
        mock_client.messages.create.return_value = mock_response

        with patch("anthropic.Anthropic", mock_cls):
            ClaudeService().chat(trader_user, "Any tips?")

        call_kwargs = mock_client.messages.create.call_args.kwargs
        assert "Trader's recent activity" in call_kwargs["system"]
        assert "BTC/USD" in call_kwargs["system"]
