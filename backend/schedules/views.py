from datetime import timedelta

from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsAdminForWriteOrAuthenticatedRead
from batches.models import Batch

from .filters import SessionFilter
from .models import Session
from .serializers import SessionSerializer, SessionWriteSerializer


class SessionViewSet(viewsets.ModelViewSet):
    queryset = (
        Session.objects.all()
        .select_related("batch")
        .order_by("session_date", "id")
    )
    filterset_class = SessionFilter
    permission_classes = [IsAdminForWriteOrAuthenticatedRead]
    search_fields = ("title", "batch__batch_name", "description")
    ordering_fields = ("session_date", "created_at", "session_type")
    ordering = ("session_date",)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return SessionWriteSerializer
        return SessionSerializer

    @action(
        detail=False,
        methods=["post"],
        url_path="generate",
        permission_classes=[IsAdmin],
    )
    def generate(self, request):
        batch_id = request.data.get("batch_id")
        if not batch_id:
            return Response(
                {"detail": "batch_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        batch = get_object_or_404(Batch, pk=batch_id)
        training_days = batch.training_days or []
        if not training_days:
            return Response(
                {"detail": "Batch has no training_days configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_count = 0
        day = batch.start_date
        while day <= batch.end_date:
            weekday_name = day.strftime("%A")
            if weekday_name in training_days:
                _, created = Session.objects.get_or_create(
                    batch=batch,
                    session_date=day,
                    defaults={
                        "session_type": Session.SessionType.CLASS,
                        "title": f"{weekday_name} session",
                        "description": "",
                    },
                )
                if created:
                    created_count += 1
            day += timedelta(days=1)

        return Response(
            {
                "batch_id": batch.id,
                "sessions_created": created_count,
            }
        )
