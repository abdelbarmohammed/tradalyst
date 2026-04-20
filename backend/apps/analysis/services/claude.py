import logging
from datetime import date, timedelta
from django.conf import settings

from apps.users.models import CustomUser
from apps.trades.models import Trade
from core.constants import CHAT_HISTORY_LIMIT, TRADE_SUMMARY_DAYS, AI_INSIGHT_MIN_TRADES
from ..models import AiInsight, ChatMessage
from .prompts import (
    WEEKLY_INSIGHT_SYSTEM,
    build_insight_user_message,
    build_chat_system_with_context,
)

logger = logging.getLogger(__name__)

_MODEL = "claude-sonnet-4-6"
_INSIGHT_MAX_TOKENS = 1500
_CHAT_MAX_TOKENS = 800


def _build_trade_summary(user: CustomUser, days: int = TRADE_SUMMARY_DAYS) -> str:
    """Serialise a user's recent trades into a plain-text block for Claude."""
    since = date.today() - timedelta(days=days)
    trades = (
        Trade.objects
        .filter(user=user, entry_time__date__gte=since)
        .order_by("entry_time")
    )
    if not trades.exists():
        return "No trades recorded in this period."

    lines = [
        f"Period: last {days} days ({since} to {date.today()})",
        f"Total trades: {trades.count()}",
        "",
    ]
    for t in trades:
        pnl_str = f"P&L: {t.pnl}" if t.pnl is not None else "P&L: open"
        lines.append(
            f"- {t.pair} {t.direction.upper()} | Entry: {t.entry_price} | "
            f"Exit: {t.exit_price or 'open'} | {pnl_str} | "
            f"RR: {t.risk_reward_ratio or '—'} | Result: {t.result or 'open'} | "
            f"Emotion: {t.emotion or '—'} | Notes: {t.notes or '—'}"
        )
    return "\n".join(lines)


class ClaudeService:
    def __init__(self) -> None:
        from anthropic import Anthropic
        api_key = settings.CLAUDE_API_KEY
        if not api_key:
            raise ValueError("CLAUDE_API_KEY is not configured.")
        self._client = Anthropic(api_key=api_key)

    def generate_weekly_insight(self, user: CustomUser) -> AiInsight:
        """Generate and persist a Claude AI insight for the given trader."""
        since = date.today() - timedelta(days=TRADE_SUMMARY_DAYS)
        trade_count = Trade.objects.filter(user=user, entry_time__date__gte=since).count()

        if trade_count < AI_INSIGHT_MIN_TRADES:
            raise ValueError(
                f"At least {AI_INSIGHT_MIN_TRADES} trades are required before AI insights "
                f"activate. You have {trade_count}."
            )

        summary = _build_trade_summary(user)
        response = self._client.messages.create(
            model=_MODEL,
            max_tokens=_INSIGHT_MAX_TOKENS,
            system=WEEKLY_INSIGHT_SYSTEM,
            messages=[{"role": "user", "content": build_insight_user_message(summary)}],
        )
        content: str = response.content[0].text

        return AiInsight.objects.create(
            user=user,
            content=content,
            period_start=since,
            period_end=date.today(),
            trade_count=trade_count,
        )

    def chat(self, user: CustomUser, user_message: str) -> ChatMessage:
        """Send a message to Claude using the trader's history as context and persist both turns."""
        trade_context = _build_trade_summary(user)

        recent_history = list(
            ChatMessage.objects
            .filter(user=user)
            .order_by("-created_at")[:CHAT_HISTORY_LIMIT]
        )
        recent_history.reverse()

        messages = [{"role": m.role, "content": m.content} for m in recent_history]
        messages.append({"role": "user", "content": user_message})

        response = self._client.messages.create(
            model=_MODEL,
            max_tokens=_CHAT_MAX_TOKENS,
            system=build_chat_system_with_context(trade_context),
            messages=messages,
        )
        assistant_text: str = response.content[0].text

        ChatMessage.objects.create(user=user, role=ChatMessage.MessageRole.USER, content=user_message)
        return ChatMessage.objects.create(
            user=user,
            role=ChatMessage.MessageRole.ASSISTANT,
            content=assistant_text,
        )
