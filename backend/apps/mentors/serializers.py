import logging
from rest_framework import serializers
from apps.users.serializers import UserProfileSerializer
from .models import MentorAssignment, MentorAnnotation

logger = logging.getLogger(__name__)


class MentorAssignmentSerializer(serializers.ModelSerializer):
    mentor_detail = UserProfileSerializer(source="mentor", read_only=True)

    class Meta:
        model = MentorAssignment
        fields = ("id", "trader", "mentor", "mentor_detail", "is_active", "created_at")
        read_only_fields = ("id", "trader", "created_at")

    def validate_mentor(self, mentor):
        from apps.users.models import Role
        if mentor.role != Role.MENTOR:
            raise serializers.ValidationError("The assigned user must have the mentor role.")
        return mentor


class MentorAnnotationSerializer(serializers.ModelSerializer):
    mentor_email = serializers.EmailField(source="mentor.email", read_only=True)

    class Meta:
        model = MentorAnnotation
        fields = ("id", "trade", "mentor", "mentor_email", "body", "created_at", "updated_at")
        read_only_fields = ("id", "mentor", "created_at", "updated_at")
