import logging
from decimal import Decimal
from django.db.models import Sum, Avg, Count, Max, Min, QuerySet
from rest_framework import generics
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsTrader
from .models import Trade, TradeResult
from .serializers import TradeSerializer, TradeStatsSerializer
from .filters import TradeFilter

logger = logging.getLogger(__name__)


class TradeListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTrader]
    serializer_class = TradeSerializer
    filterset_class = TradeFilter
    ordering_fields = ["entry_time", "pnl", "created_at"]
    ordering = ["-entry_time"]

    def get_queryset(self) -> QuerySet:
        return Trade.objects.filter(user=self.request.user)

    def perform_create(self, serializer: TradeSerializer) -> None:
        serializer.save(user=self.request.user)


class TradeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTrader]
    serializer_class = TradeSerializer

    def get_queryset(self) -> QuerySet:
        return Trade.objects.filter(user=self.request.user)


class TradeStatsView(APIView):
    permission_classes = [IsTrader]

    def get(self, request: Request) -> Response:
        """Return aggregate trading statistics for the authenticated trader."""
        qs = Trade.objects.filter(user=request.user)
        closed = qs.exclude(pnl__isnull=True)

        winning = closed.filter(result=TradeResult.WIN).count()
        losing = closed.filter(result=TradeResult.LOSS).count()
        breakeven = closed.filter(result=TradeResult.BREAKEVEN).count()
        closed_count = closed.count()

        win_rate = (winning / closed_count * 100) if closed_count > 0 else 0.0

        agg = closed.aggregate(
            total_pnl=Sum("pnl"),
            avg_pnl=Avg("pnl"),
            avg_rr=Avg("risk_reward_ratio"),
            best_pnl=Max("pnl"),
            worst_pnl=Min("pnl"),
        )

        most_traded = (
            qs.values("pair")
            .annotate(count=Count("id"))
            .order_by("-count")
            .first()
        )

        stats = {
            "total_trades": qs.count(),
            "closed_trades": closed_count,
            "winning_trades": winning,
            "losing_trades": losing,
            "breakeven_trades": breakeven,
            "win_rate": round(win_rate, 2),
            "total_pnl": agg["total_pnl"] or Decimal("0"),
            "avg_pnl_per_trade": agg["avg_pnl"] or Decimal("0"),
            "avg_risk_reward": agg["avg_rr"],
            "max_drawdown": self._calculate_max_drawdown(closed.order_by("entry_time")),
            "best_trade_pnl": agg["best_pnl"],
            "worst_trade_pnl": agg["worst_pnl"],
            "most_traded_pair": most_traded["pair"] if most_traded else None,
        }

        return Response(TradeStatsSerializer(stats).data)

    @staticmethod
    def _calculate_max_drawdown(closed_trades: QuerySet) -> Decimal:
        """Peak-to-trough decline in cumulative P&L across chronological trades."""
        cumulative = Decimal("0")
        peak = Decimal("0")
        max_dd = Decimal("0")
        for trade in closed_trades.only("pnl"):
            cumulative += trade.pnl or Decimal("0")
            if cumulative > peak:
                peak = cumulative
            drawdown = peak - cumulative
            if drawdown > max_dd:
                max_dd = drawdown
        return max_dd
