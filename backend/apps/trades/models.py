import logging
from django.db import models
from apps.users.models import CustomUser

logger = logging.getLogger(__name__)


class Direction(models.TextChoices):
    LONG = "long", "Long"
    SHORT = "short", "Short"


class TradeResult(models.TextChoices):
    WIN = "win", "Win"
    LOSS = "loss", "Loss"
    BREAKEVEN = "breakeven", "Breakeven"


class Emotion(models.TextChoices):
    CALM = "calm", "Calm"
    CONFIDENT = "confident", "Confident"
    FEARFUL = "fearful", "Fearful"
    GREEDY = "greedy", "Greedy"
    ANXIOUS = "anxious", "Anxious"
    FOMO = "fomo", "FOMO"
    REVENGE = "revenge", "Revenge"
    NEUTRAL = "neutral", "Neutral"


class Trade(models.Model):
    """A single journal entry for one trade."""

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="trades")
    pair = models.CharField(max_length=20)
    direction = models.CharField(max_length=5, choices=Direction.choices)
    entry_price = models.DecimalField(max_digits=20, decimal_places=8)
    exit_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    quantity = models.DecimalField(max_digits=20, decimal_places=8)
    entry_time = models.DateTimeField()
    exit_time = models.DateTimeField(null=True, blank=True)
    pnl = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    risk_reward_ratio = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    result = models.CharField(max_length=10, choices=TradeResult.choices, blank=True)
    emotion = models.CharField(max_length=10, choices=Emotion.choices, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trades_trade"
        ordering = ["-entry_time"]

    def __str__(self) -> str:
        return f"{self.user.email} | {self.pair} {self.direction} @ {self.entry_price}"
