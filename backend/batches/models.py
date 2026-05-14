from django.conf import settings
from django.db import models


class Batch(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"
        UPCOMING = "UPCOMING", "Upcoming"

    batch_name = models.CharField(max_length=255)
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="mentored_batches",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    duration_months = models.PositiveIntegerField()
    training_days = models.JSONField(default=list, blank=True)
    attendance_target = models.PositiveIntegerField(default=75)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPCOMING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.batch_name
