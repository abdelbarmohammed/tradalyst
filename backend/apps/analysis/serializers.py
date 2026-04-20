import logging
from rest_framework import serializers
from .models import AiInsight, ChatMessage

logger = logging.getLogger(__name__)


class AiInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiInsight
        fields = ("id", "content", "period_start", "period_end", "trade_count", "created_at")
        read_only_fields = ("id", "content", "period_start", "period_end", "trade_count", "created_at")


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ("id", "role", "content", "created_at")
        read_only_fields = ("id", "role", "created_at")


class ChatInputSerializer(serializers.Serializer):
    message = serializers.CharField(min_length=1, max_length=2000)
