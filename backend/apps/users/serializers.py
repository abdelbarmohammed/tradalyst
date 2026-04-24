import logging
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

logger = logging.getLogger(__name__)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ("email", "display_name", "role", "password", "password_confirm")

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
        fields = ("id", "email", "display_name", "bio", "role", "plan", "onboarding_completed", "date_joined")
        read_only_fields = ("id", "email", "role", "plan", "date_joined")


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "email", "display_name", "bio", "role", "is_active", "date_joined")
        read_only_fields = ("id", "email", "date_joined")
