import logging
from django.db import models
from apps.users.models import CustomUser

logger = logging.getLogger(__name__)


class AiInsight(models.Model):
    """A weekly AI-generated insight report for a trader."""

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="insights")
    content = models.TextField()
    period_start = models.DateField()
    period_end = models.DateField()
    trade_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "analysis_aiinsight"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Insight for {self.user.email} ({self.period_start} – {self.period_end})"


class ChatMessage(models.Model):
    class MessageRole(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="chat_messages")
    role = models.CharField(max_length=10, choices=MessageRole.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "analysis_chatmessage"
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.role} | {self.user.email} | {self.created_at}"
