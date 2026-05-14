from django.contrib.auth import get_user_model
from rest_framework import serializers

from batches.models import Batch
from developers.models import Developer

from .models import Assignment, Submission

User = get_user_model()


class BatchMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = (
            "id",
            "batch_name",
            "status",
            "start_date",
            "end_date",
        )


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email")


class SubmissionSerializer(serializers.ModelSerializer):
    is_late = serializers.SerializerMethodField()
    developer_code = serializers.CharField(
        source="developer.developer_code", read_only=True
    )
    developer_name = serializers.CharField(
        source="developer.full_name", read_only=True
    )

    class Meta:
        model = Submission
        fields = (
            "id",
            "assignment",
            "developer",
            "developer_code",
            "developer_name",
            "github_link",
            "notes",
            "submitted_at",
            "is_late",
        )
        read_only_fields = ("submitted_at", "is_late")

    def get_is_late(self, obj: Submission) -> bool:
        return obj.is_late


class AssignmentSerializer(serializers.ModelSerializer):
    batch_detail = BatchMiniSerializer(source="batch", read_only=True)
    created_by_detail = UserMiniSerializer(source="created_by", read_only=True)
    submission_count = serializers.SerializerMethodField()
    is_submitted = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = (
            "id",
            "batch",
            "batch_detail",
            "title",
            "description",
            "due_date",
            "created_by",
            "created_by_detail",
            "created_at",
            "submission_count",
            "is_submitted",
        )

    def get_submission_count(self, obj: Assignment) -> int:
        return Submission.objects.filter(assignment=obj).count()

    def get_is_submitted(self, obj: Assignment) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        if getattr(user, "role", None) != User.Role.DEVELOPER:
            return False
        from developers.models import Developer

        try:
            dev = user.developer_profile
        except Developer.DoesNotExist:
            return False
        return Submission.objects.filter(assignment=obj, developer=dev).exists()


class AssignmentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = (
            "batch",
            "title",
            "description",
            "due_date",
        )

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class SubmissionWriteSerializer(serializers.ModelSerializer):
    developer = serializers.PrimaryKeyRelatedField(
        queryset=Developer.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Submission
        fields = (
            "assignment",
            "developer",
            "github_link",
            "notes",
        )
