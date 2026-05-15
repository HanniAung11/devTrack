from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

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
    assignment_title = serializers.CharField(
        source="assignment.title", read_only=True
    )
    assignment_due_date = serializers.DateField(
        source="assignment.due_date", read_only=True
    )

    class Meta:
        model = Submission
        fields = (
            "id",
            "assignment",
            "assignment_title",
            "assignment_due_date",
            "developer",
            "developer_code",
            "developer_name",
            "github_link",
            "notes",
            "status",
            "review_note",
            "reviewed_at",
            "submitted_at",
            "is_late",
        )
        read_only_fields = (
            "submitted_at",
            "is_late",
            "reviewed_at",
            "developer",
            "developer_code",
            "developer_name",
            "assignment_title",
            "assignment_due_date",
        )

    def get_is_late(self, obj: Submission) -> bool:
        return obj.is_late


class SubmissionReviewSerializer(serializers.ModelSerializer):
    """Admin-only: accept or reject a submission."""

    class Meta:
        model = Submission
        fields = ("status", "review_note")

    def validate_status(self, value: str) -> str:
        if value not in (Submission.Status.ACCEPTED, Submission.Status.REJECTED):
            raise serializers.ValidationError(
                "Status must be ACCEPTED or REJECTED."
            )
        return value


class AssignmentSerializer(serializers.ModelSerializer):
    batch_detail = BatchMiniSerializer(source="batch", read_only=True)
    created_by_detail = UserMiniSerializer(source="created_by", read_only=True)
    submission_count = serializers.SerializerMethodField()
    is_submitted = serializers.SerializerMethodField()
    can_submit = serializers.SerializerMethodField()
    submission_status = serializers.SerializerMethodField()
    submission_is_late = serializers.SerializerMethodField()
    submission_id = serializers.SerializerMethodField()

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
            "can_submit",
            "submission_status",
            "submission_is_late",
            "submission_id",
        )

    def get_submission_count(self, obj: Assignment) -> int:
        return Submission.objects.filter(assignment=obj).count()

    def _developer_submission(self, obj: Assignment):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        if getattr(request.user, "role", None) != User.Role.DEVELOPER:
            return None
        dev = Developer.objects.filter(user=request.user).first()
        if dev is None:
            return None
        return Submission.objects.filter(assignment=obj, developer=dev).first()

    def get_is_submitted(self, obj: Assignment) -> bool:
        sub = self._developer_submission(obj)
        if sub is None:
            return False
        return sub.status in (Submission.Status.PENDING, Submission.Status.ACCEPTED)

    def get_can_submit(self, obj: Assignment) -> bool:
        sub = self._developer_submission(obj)
        if sub is None:
            return True
        return sub.status == Submission.Status.REJECTED

    def get_submission_status(self, obj: Assignment) -> str | None:
        sub = self._developer_submission(obj)
        return sub.status if sub else None

    def get_submission_is_late(self, obj: Assignment) -> bool | None:
        sub = self._developer_submission(obj)
        return sub.is_late if sub else None

    def get_submission_id(self, obj: Assignment) -> int | None:
        sub = self._developer_submission(obj)
        return sub.id if sub else None


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
        extra_kwargs = {
            "developer": {"required": False, "allow_null": True},
        }

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if (
            request
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == User.Role.DEVELOPER
        ):
            fields.pop("developer", None)
        return fields

    def validate_github_link(self, value: str) -> str:
        v = (value or "").strip()
        if not v:
            raise serializers.ValidationError("GitHub link is required.")
        if not v.startswith(("http://", "https://")):
            v = f"https://{v}"
        return v

    def validate(self, attrs):
        request = self.context.get("request")
        assignment = attrs.get("assignment")
        if assignment is None and self.instance is not None:
            assignment = self.instance.assignment

        if (
            request
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == User.Role.DEVELOPER
        ):
            dev = Developer.objects.filter(user=request.user).first()
            if dev is None:
                raise ValidationError(
                    "Complete your developer profile (Profile page) before submitting."
                )
            if not dev.batch_id:
                raise ValidationError(
                    "You are not assigned to a batch yet. Ask an admin to add you to a batch "
                    "before you can submit assignments."
                )
            if assignment and assignment.batch_id != dev.batch_id:
                raise ValidationError(
                    "This assignment belongs to another batch. You can only submit work for "
                    "assignments in your own batch."
                )

            existing = Submission.objects.filter(
                assignment=assignment, developer=dev
            ).first()

            if self.instance is None and existing is not None:
                if existing.status == Submission.Status.ACCEPTED:
                    raise ValidationError(
                        "This assignment is closed — your submission was already accepted."
                    )
                if existing.status == Submission.Status.PENDING:
                    raise ValidationError(
                        "Your submission is awaiting review. You cannot submit again yet."
                    )
                if existing.status == Submission.Status.REJECTED:
                    raise ValidationError(
                        "Use resubmit on your rejected submission instead of creating a new one."
                    )

            if self.instance is not None:
                if self.instance.developer_id != dev.id:
                    raise ValidationError("You can only edit your own submissions.")
                if self.instance.status == Submission.Status.ACCEPTED:
                    raise ValidationError(
                        "This assignment is closed — your submission was accepted."
                    )
                if self.instance.status == Submission.Status.PENDING:
                    raise ValidationError(
                        "Your submission is awaiting review and cannot be edited."
                    )
                if self.instance.status != Submission.Status.REJECTED:
                    raise ValidationError("This submission cannot be updated.")

            attrs["developer"] = dev
            return attrs

        if not attrs.get("developer"):
            raise serializers.ValidationError(
                {"developer": "This field is required."}
            )

        return attrs

    def create(self, validated_data):
        validated_data["status"] = Submission.Status.PENDING
        validated_data["submitted_at"] = timezone.now()
        validated_data["review_note"] = ""
        validated_data["reviewed_at"] = None
        validated_data["reviewed_by"] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data["status"] = Submission.Status.PENDING
        validated_data["submitted_at"] = timezone.now()
        validated_data["review_note"] = ""
        validated_data["reviewed_at"] = None
        validated_data["reviewed_by"] = None
        return super().update(instance, validated_data)
