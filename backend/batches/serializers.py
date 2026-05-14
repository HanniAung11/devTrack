from django.contrib.auth import get_user_model
from rest_framework import serializers

from developers.models import Developer
from schedules.models import Session

from .models import Batch

User = get_user_model()


class MentorNestedSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "username", "display_name")

    def get_display_name(self, obj: User) -> str:
        full = obj.get_full_name()
        return full.strip() if full else obj.email


class BatchSerializer(serializers.ModelSerializer):
    """Nested read representation."""

    mentor = MentorNestedSerializer(read_only=True)
    total_developers = serializers.SerializerMethodField()
    total_sessions = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = (
            "id",
            "batch_name",
            "mentor",
            "start_date",
            "end_date",
            "duration_months",
            "training_days",
            "attendance_target",
            "status",
            "created_at",
            "total_developers",
            "total_sessions",
            "completion_percentage",
        )

    def get_total_developers(self, obj: Batch) -> int:
        return Developer.objects.filter(batch=obj).count()

    def get_total_sessions(self, obj: Batch) -> int:
        return Session.objects.filter(batch=obj).count()

    def get_completion_percentage(self, obj: Batch) -> float:
        total = Session.objects.filter(batch=obj).count()
        if total == 0:
            return 0.0
        done = Session.objects.filter(batch=obj, is_completed=True).count()
        return round(100.0 * done / total, 1)


class BatchWriteSerializer(serializers.ModelSerializer):
    mentor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.ADMIN),
    )

    class Meta:
        model = Batch
        fields = (
            "batch_name",
            "mentor",
            "start_date",
            "end_date",
            "duration_months",
            "training_days",
            "attendance_target",
            "status",
        )

    def validate(self, attrs):
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        inst = self.instance
        if inst is not None:
            start = start if start is not None else inst.start_date
            end = end if end is not None else inst.end_date
        if start and end and end < start:
            raise serializers.ValidationError(
                {"end_date": "End date must be on or after start date."}
            )
        return attrs
