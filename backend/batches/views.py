from rest_framework import viewsets

from accounts.permissions import IsAdminForWriteOrAuthenticatedRead

from .filters import BatchFilter
from .models import Batch
from .serializers import BatchSerializer, BatchWriteSerializer


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all().select_related("mentor").order_by("-created_at")
    filterset_class = BatchFilter
    permission_classes = [IsAdminForWriteOrAuthenticatedRead]
    search_fields = ("batch_name", "mentor__email", "mentor__username")
    ordering_fields = ("created_at", "batch_name", "start_date", "status")
    ordering = ("-created_at",)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return BatchWriteSerializer
        return BatchSerializer
