from django.conf import settings
from django.db import models

from developers.models import Developer
from schedules.models import Session


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"
        LEAVE = "LEAVE", "Leave"

    developer = models.ForeignKey(
        Developer, on_delete=models.CASCADE, related_name="attendance_records"
    )
    session = models.ForeignKey(
        Session, on_delete=models.CASCADE, related_name="attendance_records"
    )
    status = models.CharField(max_length=20, choices=Status.choices)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="marked_attendance",
    )
    marked_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    class Meta:
        unique_together = ("developer", "session")

    def __str__(self) -> str:
        return f"{self.developer} — {self.status}"
