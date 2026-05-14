from rest_framework import viewsets

from accounts.permissions import IsAdminForWriteOrAuthenticatedRead

from .filters import DeveloperFilter
from .models import Developer
from .serializers import DeveloperSerializer, DeveloperWriteSerializer


class DeveloperViewSet(viewsets.ModelViewSet):
    queryset = (
        Developer.objects.all()
        .select_related("user", "batch")
        .order_by("developer_code")
    )
    filterset_class = DeveloperFilter
    permission_classes = [IsAdminForWriteOrAuthenticatedRead]
    search_fields = (
        "developer_code",
        "full_name",
        "email",
        "user__email",
        "user__username",
    )
    ordering_fields = ("joined_at", "full_name", "developer_code", "email")
    ordering = ("developer_code",)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return DeveloperWriteSerializer
        return DeveloperSerializer

    def perform_create(self, serializer):
        dev = serializer.save()
        self._sync_user_email(dev)

    def perform_update(self, serializer):
        dev = serializer.save()
        self._sync_user_email(dev)

    @staticmethod
    def _sync_user_email(dev: Developer) -> None:
        user = dev.user
        if user.email != dev.email:
            user.email = dev.email
            user.username = dev.email
            user.save(update_fields=["email", "username"])
