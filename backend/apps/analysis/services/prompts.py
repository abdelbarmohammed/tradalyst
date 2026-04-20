import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / "tools" / "prompts"


def _load(filename: str) -> str:
    """Load a prompt template from tools/prompts/. Falls back to inline default if missing."""
    path = _PROMPTS_DIR / filename
    try:
        return path.read_text(encoding="utf-8").strip()
    except OSError:
        logger.warning("Prompt file not found: %s — using inline default", path)
        return ""


WEEKLY_INSIGHT_SYSTEM: str = _load("weekly-insight.txt") or (
    "You are Tradalyst's AI trading coach. Analyse the trader's journal data and deliver "
    "a structured weekly insight report covering: pattern summary, emotional analysis, "
    "strengths, areas to improve, and one key metric. Be direct, specific, and concise. "
    "Write in second person. Under 400 words."
)

CHAT_SYSTEM: str = _load("chat-system.txt") or (
    "You are Tradalyst's AI trading coach in a live chat. Use the trader's trade history "
    "to answer questions and provide analysis. Be concise. Never give financial advice or "
    "price predictions. Respond in the same language the trader uses."
)


def build_insight_user_message(trade_summary: str) -> str:
    """Format the trade summary for a weekly insight generation request."""
    return (
        "Here is my trading data for the past 90 days. "
        "Please analyse it and give me a weekly insight report.\n\n"
        + trade_summary
    )


def build_chat_system_with_context(trade_context: str) -> str:
    """Inject the trader's recent activity into the chat system prompt."""
    return f"{CHAT_SYSTEM}\n\n[Trader's recent activity]\n{trade_context}"
