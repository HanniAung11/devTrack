from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from accounts.models import CustomUser
from accounts.permissions import (
    IsAdmin,
    IsAdminForWriteOrAuthenticatedRead,
    IsAdminOrReadOrDeveloperSubmissionWrite,
)
from developers.models import Developer

from .filters import AssignmentFilter, SubmissionFilter
from .models import Assignment, Submission
from .serializers import (
    AssignmentSerializer,
    AssignmentWriteSerializer,
    SubmissionReviewSerializer,
    SubmissionSerializer,
    SubmissionWriteSerializer,
)


class AssignmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminForWriteOrAuthenticatedRead]
    filterset_class = AssignmentFilter
    search_fields = ("title", "description", "batch__batch_name")
    ordering_fields = ("created_at", "due_date", "title")
    ordering = ("-created_at",)

    def get_queryset(self):
        qs = Assignment.objects.select_related("batch", "created_by").order_by(
            "-created_at"
        )
        user = self.request.user
        if getattr(user, "role", None) == CustomUser.Role.DEVELOPER:
            dev = Developer.objects.filter(user=user).first()
            if dev is None:
                return Assignment.objects.none()
            batch = dev.batch
            if batch:
                return qs.filter(batch=batch)
            return Assignment.objects.none()
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return AssignmentWriteSerializer
        return AssignmentSerializer


class SubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOrDeveloperSubmissionWrite]
    filterset_class = SubmissionFilter
    search_fields = ("github_link", "developer__full_name", "assignment__title")
    ordering_fields = ("submitted_at", "status")
    ordering = ("-submitted_at",)

    def get_queryset(self):
        qs = Submission.objects.select_related(
            "assignment", "developer", "assignment__batch"
        ).order_by("-submitted_at")
        user = self.request.user
        if getattr(user, "role", None) == CustomUser.Role.DEVELOPER:
            dev = Developer.objects.filter(user=user).first()
            if dev is None:
                return Submission.objects.none()
            return qs.filter(developer=dev)
        return qs

    def get_serializer_class(self):
        if self.action == "review":
            return SubmissionReviewSerializer
        if self.action in ("create", "update", "partial_update"):
            return SubmissionWriteSerializer
        return SubmissionSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) == CustomUser.Role.DEVELOPER:
            dev = Developer.objects.filter(user=user).first()
            if dev is None:
                raise ValidationError(
                    {"detail": "Create your developer profile before submitting."}
                )
            serializer.save(developer=dev)
            return
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) == CustomUser.Role.DEVELOPER:
            dev = Developer.objects.filter(user=user).first()
            if dev is None:
                raise ValidationError(
                    {"detail": "Create your developer profile before submitting."}
                )
            serializer.save(developer=dev)
            return
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def review(self, request, pk=None):
        submission = self.get_object()
        if submission.status == Submission.Status.ACCEPTED:
            raise ValidationError("This submission is already accepted and closed.")
        serializer = SubmissionReviewSerializer(
            submission,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        from django.utils import timezone

        submission.status = serializer.validated_data["status"]
        submission.review_note = serializer.validated_data.get(
            "review_note", submission.review_note
        )
        submission.reviewed_at = timezone.now()
        submission.reviewed_by = request.user
        submission.save(
            update_fields=["status", "review_note", "reviewed_at", "reviewed_by"]
        )
        return Response(SubmissionSerializer(submission).data)
