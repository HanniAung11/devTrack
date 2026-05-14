from django.db import models

from batches.models import Batch


class Session(models.Model):
    class SessionType(models.TextChoices):
        CLASS = "CLASS", "Class"
        ASSIGNMENT = "ASSIGNMENT", "Assignment"
        EXAM = "EXAM", "Exam"
        HOLIDAY = "HOLIDAY", "Holiday"

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="sessions")
    session_date = models.DateField()
    session_type = models.CharField(max_length=20, choices=SessionType.choices)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["session_date", "id"]

    def __str__(self) -> str:
        return f"{self.batch.batch_name} — {self.title}"
