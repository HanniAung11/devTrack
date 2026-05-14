from django.contrib.auth import get_user_model
from rest_framework import serializers

from assignments.models import Submission
from attendance.models import Attendance

from .models import Developer

User = get_user_model()


class DeveloperMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Developer
        fields = ("id", "developer_code", "full_name", "email")


class BatchMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    batch_name = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)


class DeveloperSerializer(serializers.ModelSerializer):
    batch_detail = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source="user.email", read_only=True)
    attendance_percentage = serializers.SerializerMethodField()
    submitted_assignments_count = serializers.SerializerMethodField()

    class Meta:
        model = Developer
        fields = (
            "id",
            "user",
            "user_email",
            "developer_code",
            "full_name",
            "email",
            "phone",
            "batch",
            "batch_detail",
            "is_active",
            "joined_at",
            "attendance_percentage",
            "submitted_assignments_count",
        )
        read_only_fields = ("developer_code", "joined_at")

    def get_batch_detail(self, obj: Developer):
        if not obj.batch_id:
            return None
        return {
            "id": obj.batch_id,
            "batch_name": obj.batch.batch_name,
            "status": obj.batch.status,
        }

    def get_attendance_percentage(self, obj: Developer) -> float | None:
        qs = Attendance.objects.filter(developer=obj)
        total = qs.count()
        if total == 0:
            return None
        present = qs.filter(status=Attendance.Status.PRESENT).count()
        return round(100.0 * present / total, 1)

    def get_submitted_assignments_count(self, obj: Developer) -> int:
        return Submission.objects.filter(developer=obj).count()


class DeveloperWriteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.DEVELOPER)
    )

    class Meta:
        model = Developer
        fields = (
            "user",
            "full_name",
            "email",
            "phone",
            "batch",
            "is_active",
        )

    def validate_user(self, user: User) -> User:
        qs = Developer.objects.filter(user=user)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "This user already has a developer profile."
            )
        return user
