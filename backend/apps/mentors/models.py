import logging
from django.db import models
from apps.users.models import CustomUser
from apps.trades.models import Trade

logger = logging.getLogger(__name__)


class MentorAssignment(models.Model):
    """Links a trader to a mentor. Created by the trader (Pro plan feature)."""

    trader = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="mentor_assignments")
    mentor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="trader_assignments")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "mentors_mentorassignment"
        unique_together = [("trader", "mentor")]

    def __str__(self) -> str:
        return f"{self.trader.email} → {self.mentor.email}"


class MentorAnnotation(models.Model):
    """A mentor's note on a specific trade belonging to one of their assigned traders."""

    trade = models.ForeignKey(Trade, on_delete=models.CASCADE, related_name="annotations")
    mentor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="annotations")
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "mentors_mentorannotation"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.mentor.email} on trade {self.trade_id}"
