import re
import logging
from django.utils.html import strip_tags
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

logger = logging.getLogger(__name__)


def _sanitize_display_name(value: str) -> str:
    """Strip HTML tags and dangerous patterns from a display name."""
    clean = strip_tags(value)
    clean = clean.replace("<", "").replace(">", "")
    # Remove common injection patterns case-insensitively
    clean = re.sub(r"javascript:", "", clean, flags=re.IGNORECASE)
    clean = re.sub(r"on\w+=", "", clean, flags=re.IGNORECASE)
    return clean.strip()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ("email", "display_name", "role", "password", "password_confirm", "language_preference")

    def validate_display_name(self, value: str) -> str:
        clean = _sanitize_display_name(value)
        if len(clean) < 2:
            raise serializers.ValidationError("Display name must be at least 2 characters.")
        if len(clean) > 50:
            raise serializers.ValidationError("Display name must be 50 characters or less.")
        return clean

    def validate_email(self, value: str) -> str:
        from django.core.validators import validate_email as django_validate_email
        from django.core.exceptions import ValidationError as DjangoValidationError

        try:
            django_validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")

        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")

        return value

    def validate_role(self, role: str) -> str:
        if role == "admin":
            raise serializers.ValidationError("No puedes registrarte como administrador.")
        return role

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data: dict) -> CustomUser:
        return CustomUser.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "email", "display_name", "bio", "role", "plan", "onboarding_completed", "date_joined", "language_preference", "theme_preference", "pinned_assets")
        read_only_fields = ("id", "email", "role", "plan", "date_joined")

    def validate_display_name(self, value: str) -> str:
        clean = _sanitize_display_name(value)
        if len(clean) < 2:
            raise serializers.ValidationError("Display name must be at least 2 characters.")
        if len(clean) > 50:
            raise serializers.ValidationError("Display name must be 50 characters or less.")
        return clean

    def validate_bio(self, value: str) -> str:
        return strip_tags(value or "")


class AdminUserSerializer(serializers.ModelSerializer):
    trade_count = serializers.SerializerMethodField()
    last_active = serializers.SerializerMethodField()
    mentor_name = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            "id", "email", "display_name", "bio", "role", "plan",
            "is_active", "date_joined",
            "trade_count", "last_active", "mentor_name", "student_count",
        )
        read_only_fields = ("id", "email", "date_joined")

    def validate_bio(self, value: str) -> str:
        return strip_tags(value or "")

    def get_trade_count(self, obj: CustomUser) -> int:
        ann = getattr(obj, "trade_count_ann", None)
        if ann is not None:
            return ann
        return obj.trades.count()

    def get_last_active(self, obj: CustomUser) -> str:
        last = getattr(obj, "last_trade_date_ann", None)
        if last is None:
            first_trade = obj.trades.order_by("-entry_time").first()
            if first_trade:
                last = first_trade.entry_time
        if last:
            return last.date().isoformat()
        return obj.date_joined.date().isoformat()

    def get_mentor_name(self, obj: CustomUser) -> str | None:
        if obj.role != "trader":
            return None
        active = getattr(obj, "active_mentor_assignments", None)
        if active is not None:
            return active[0].mentor.display_name or active[0].mentor.email.split("@")[0] if active else None
        assignment = obj.mentor_assignments.filter(is_active=True).select_related("mentor").first()
        if assignment:
            return assignment.mentor.display_name or assignment.mentor.email.split("@")[0]
        return None

    def get_student_count(self, obj: CustomUser) -> int | None:
        if obj.role != "mentor":
            return None
        active = getattr(obj, "active_trader_assignments", None)
        if active is not None:
            return len(active)
        return obj.trader_assignments.filter(is_active=True).count()
