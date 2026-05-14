from rest_framework import viewsets

from accounts.models import CustomUser
from accounts.permissions import IsAdminForWriteOrAuthenticatedRead
from developers.models import Developer
from .filters import AssignmentFilter, SubmissionFilter
from .models import Assignment, Submission
from .serializers import (
    AssignmentSerializer,
    AssignmentWriteSerializer,
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
            try:
                batch = user.developer_profile.batch
            except Developer.DoesNotExist:
                return Assignment.objects.none()
            if batch:
                return qs.filter(batch=batch)
            return Assignment.objects.none()
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return AssignmentWriteSerializer
        return AssignmentSerializer


class SubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminForWriteOrAuthenticatedRead]
    filterset_class = SubmissionFilter
    search_fields = ("github_link", "developer__full_name", "assignment__title")
    ordering_fields = ("submitted_at",)
    ordering = ("-submitted_at",)

    def get_queryset(self):
        qs = Submission.objects.select_related(
            "assignment", "developer", "assignment__batch"
        ).order_by("-submitted_at")
        user = self.request.user
        if getattr(user, "role", None) == CustomUser.Role.DEVELOPER:
            try:
                dev = user.developer_profile
            except Developer.DoesNotExist:
                return Submission.objects.none()
            return qs.filter(developer=dev)
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return SubmissionWriteSerializer
        return SubmissionSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) == CustomUser.Role.DEVELOPER:
            dev = user.developer_profile
            serializer.save(developer=dev)
            return
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) == CustomUser.Role.DEVELOPER:
            dev = user.developer_profile
            serializer.save(developer=dev)
            return
        serializer.save()
