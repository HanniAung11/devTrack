from rest_framework import viewsets

from accounts.permissions import IsAdminForWriteOrAuthenticatedRead

from .filters import AttendanceFilter
from .models import Attendance
from .serializers import AttendanceSerializer, AttendanceWriteSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = (
        Attendance.objects.all()
        .select_related("developer", "session", "session__batch", "marked_by")
        .order_by("-marked_at")
    )
    filterset_class = AttendanceFilter
    permission_classes = [IsAdminForWriteOrAuthenticatedRead]
    search_fields = (
        "developer__full_name",
        "developer__email",
        "session__title",
        "note",
    )
    ordering_fields = ("marked_at", "session__session_date")
    ordering = ("-marked_at",)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return AttendanceWriteSerializer
        return AttendanceSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return ctx
