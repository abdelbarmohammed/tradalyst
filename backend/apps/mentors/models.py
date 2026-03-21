import logging
from django.db import models
from apps.users.models import CustomUser
from apps.trades.models import Trade

logger = logging.getLogger(__name__)


class MentorRequest(models.Model):
    """A mentor's request to follow a trader's journal. Trader accepts or rejects."""

    class Status(models.TextChoices):
        PENDING  = "pending",  "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    mentor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_requests")
    trader = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="received_requests")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "mentors_mentorrequest"
        unique_together = [("mentor", "trader")]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.mentor.email} → {self.trader.email} ({self.status})"


class MentorAssignment(models.Model):
    """Active mentor–trader relationship created when a MentorRequest is accepted."""

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
