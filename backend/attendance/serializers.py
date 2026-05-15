from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from developers.serializers import DeveloperMiniSerializer
from schedules.serializers import SessionSerializer

from .models import Attendance

User = get_user_model()


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email")


class AttendanceSerializer(serializers.ModelSerializer):
    developer_detail = DeveloperMiniSerializer(source="developer", read_only=True)
    session_detail = SessionSerializer(source="session", read_only=True)
    marked_by_detail = UserMiniSerializer(source="marked_by", read_only=True)

    class Meta:
        model = Attendance
        fields = (
            "id",
            "developer",
            "developer_detail",
            "session",
            "session_detail",
            "status",
            "marked_by",
            "marked_by_detail",
            "marked_at",
            "note",
        )


class AttendanceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = (
            "developer",
            "session",
            "status",
            "note",
        )

    def validate(self, attrs):
        session = attrs.get("session")
        if session is None and self.instance is not None:
            session = self.instance.session
        if session is not None:
            today = timezone.now().date()
            if session.session_date > today:
                raise serializers.ValidationError(
                    {
                        "session": "Attendance can only be recorded for today or past sessions."
                    }
                )
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["marked_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["marked_by"] = request.user
        return super().update(instance, validated_data)
