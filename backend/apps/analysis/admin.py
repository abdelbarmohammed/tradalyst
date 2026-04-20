from django.contrib import admin
from .models import AiInsight, ChatMessage


@admin.register(AiInsight)
class AiInsightAdmin(admin.ModelAdmin):
    list_display = ("user", "period_start", "period_end", "trade_count", "created_at")
    search_fields = ("user__email",)
    ordering = ("-created_at",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("user__email",)
