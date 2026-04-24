import logging
from decimal import Decimal
from rest_framework import serializers
from apps.users.models import CustomUser, Role
from apps.users.serializers import UserProfileSerializer
from apps.trades.models import Trade
from .models import MentorAssignment, MentorAnnotation, MentorRequest

logger = logging.getLogger(__name__)


class MentorRequestSerializer(serializers.ModelSerializer):
    mentor_detail = UserProfileSerializer(source="mentor", read_only=True)
    trader_detail = UserProfileSerializer(source="trader", read_only=True)

    class Meta:
        model = MentorRequest
        fields = ("id", "mentor", "trader", "mentor_detail", "trader_detail", "status", "created_at", "updated_at")
        read_only_fields = ("id", "mentor", "status", "created_at", "updated_at")


class MentorRequestCreateSerializer(serializers.Serializer):
    """Mentor sends a request by providing the trader's email."""

    trader_email = serializers.EmailField()

    def validate_trader_email(self, email: str) -> CustomUser:
        try:
            trader = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No existe ningún usuario con ese correo.")
        if trader.role != Role.TRADER:
            raise serializers.ValidationError("El usuario no es un trader.")
        return trader

    def validate(self, attrs):
        mentor = self.context["request"].user
        trader = attrs["trader_email"]
        if MentorRequest.objects.filter(mentor=mentor, trader=trader).exists():
            raise serializers.ValidationError("Ya has enviado una solicitud a este trader.")
        if MentorAssignment.objects.filter(mentor=mentor, trader=trader, is_active=True).exists():
            raise serializers.ValidationError("Ya eres mentor de este trader.")
        return attrs

    def create(self, validated_data):
        mentor = self.context["request"].user
        trader = validated_data["trader_email"]
        return MentorRequest.objects.create(mentor=mentor, trader=trader)


class MentorAssignmentSerializer(serializers.ModelSerializer):
    mentor_detail = UserProfileSerializer(source="mentor", read_only=True)
    trader_detail = UserProfileSerializer(source="trader", read_only=True)
    stats = serializers.SerializerMethodField()

    class Meta:
        model = MentorAssignment
        fields = ("id", "trader", "mentor", "mentor_detail", "trader_detail", "is_active", "created_at", "stats")
        read_only_fields = ("id", "trader", "created_at")

    def get_stats(self, obj: MentorAssignment) -> dict:
        trades = Trade.objects.filter(user=obj.trader)
        total = trades.count()
        wins = trades.filter(result="win").count()
        from django.db.models import Sum
        pnl_sum = trades.aggregate(s=Sum("pnl"))["s"] or Decimal("0")
        last = trades.order_by("-entry_time").values_list("entry_time", flat=True).first()
        return {
            "total_trades": total,
            "win_rate": round(wins / total * 100, 1) if total else 0,
            "total_pnl": float(pnl_sum),
            "last_trade_date": last.date().isoformat() if last else None,
        }

    def validate_mentor(self, mentor):
        if mentor.role != Role.MENTOR:
            raise serializers.ValidationError("The assigned user must have the mentor role.")
        return mentor


class MentorAnnotationSerializer(serializers.ModelSerializer):
    mentor_email = serializers.EmailField(source="mentor.email", read_only=True)

    class Meta:
        model = MentorAnnotation
        fields = ("id", "trade", "mentor", "mentor_email", "body", "created_at", "updated_at")
        read_only_fields = ("id", "mentor", "created_at", "updated_at")
