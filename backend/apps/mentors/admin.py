from django.contrib import admin
from .models import MentorAssignment, MentorAnnotation


@admin.register(MentorAssignment)
class MentorAssignmentAdmin(admin.ModelAdmin):
    list_display = ("trader", "mentor", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("trader__email", "mentor__email")


@admin.register(MentorAnnotation)
class MentorAnnotationAdmin(admin.ModelAdmin):
    list_display = ("mentor", "trade", "created_at")
    search_fields = ("mentor__email",)
