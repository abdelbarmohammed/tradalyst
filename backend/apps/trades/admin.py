from django.contrib import admin
from .models import Trade


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ("user", "pair", "direction", "result", "pnl", "entry_time")
    list_filter = ("direction", "result", "emotion")
    search_fields = ("user__email", "pair")
    ordering = ("-entry_time",)
