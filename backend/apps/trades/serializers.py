import logging
from decimal import Decimal
from rest_framework import serializers
from .models import Trade

logger = logging.getLogger(__name__)


class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = (
            "id", "pair", "direction", "entry_price", "exit_price", "quantity",
            "entry_time", "exit_time", "pnl", "risk_reward_ratio",
            "result", "emotion", "notes", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs: dict) -> dict:
        exit_time = attrs.get("exit_time") or getattr(self.instance, "exit_time", None)
        entry_time = attrs.get("entry_time") or getattr(self.instance, "entry_time", None)
        if exit_time and entry_time and exit_time < entry_time:
            raise serializers.ValidationError({"exit_time": "Exit time cannot be before entry time."})
        return attrs


class TradeStatsSerializer(serializers.Serializer):
    total_trades = serializers.IntegerField()
    closed_trades = serializers.IntegerField()
    winning_trades = serializers.IntegerField()
    losing_trades = serializers.IntegerField()
    breakeven_trades = serializers.IntegerField()
    win_rate = serializers.FloatField()
    total_pnl = serializers.DecimalField(max_digits=20, decimal_places=8)
    avg_pnl_per_trade = serializers.DecimalField(max_digits=20, decimal_places=8)
    avg_risk_reward = serializers.DecimalField(max_digits=10, decimal_places=4, allow_null=True)
    max_drawdown = serializers.DecimalField(max_digits=20, decimal_places=8)
    best_trade_pnl = serializers.DecimalField(max_digits=20, decimal_places=8, allow_null=True)
    worst_trade_pnl = serializers.DecimalField(max_digits=20, decimal_places=8, allow_null=True)
    most_traded_pair = serializers.CharField(allow_null=True)
