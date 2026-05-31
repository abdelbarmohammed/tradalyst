import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response

from core.constants import (
    FREE_PLAN_INSIGHTS_PER_MONTH,
    FREE_PLAN_CHAT_MESSAGES_MAX,
    FREE_PLAN_TRADES_MAX,
)
from .models import Plan

logger = logging.getLogger(__name__)


def check_plan_limit(user, feature: str) -> Response | None:
    """Return a 403 Response if a Free-plan user has exceeded a feature limit.

    Returns None when the action is allowed (Pro user, or Free user within limits).
    Import inside branches to avoid circular imports between apps.
    """
    if user.plan == Plan.PRO:
        return None

    if feature == "insight_generate":
        from apps.analysis.models import AiInsight
        now = timezone.now()
        count = AiInsight.objects.filter(
            user=user,
            created_at__year=now.year,
            created_at__month=now.month,
        ).count()
        if count >= FREE_PLAN_INSIGHTS_PER_MONTH:
            return Response(
                {
                    "error": "plan_limit",
                    "message": "Actualiza a Pro para análisis ilimitados.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

    elif feature == "chat_send":
        from apps.analysis.models import ChatMessage
        count = ChatMessage.objects.filter(
            user=user,
            role=ChatMessage.MessageRole.USER,
        ).count()
        if count >= FREE_PLAN_CHAT_MESSAGES_MAX:
            return Response(
                {
                    "error": "plan_limit",
                    "message": "Actualiza a Pro para chat ilimitado.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

    elif feature == "trade_create":
        from apps.trades.models import Trade
        count = Trade.objects.filter(user=user).count()
        if count >= FREE_PLAN_TRADES_MAX:
            return Response(
                {
                    "error": "plan_limit",
                    "message": "Has alcanzado el límite de 50 operaciones del plan Free.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

    return None
