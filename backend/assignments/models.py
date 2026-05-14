from django.conf import settings
from django.db import models
from django.utils import timezone

from batches.models import Batch
from developers.models import Developer


class Assignment(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_assignments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Submission(models.Model):
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="submissions"
    )
    developer = models.ForeignKey(
        Developer, on_delete=models.CASCADE, related_name="submissions"
    )
    github_link = models.URLField(max_length=500)
    notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("assignment", "developer")

    def __str__(self) -> str:
        return f"{self.developer.developer_code} → {self.assignment.title}"

    @property
    def is_late(self) -> bool:
        due = self.assignment.due_date
        submitted_date = timezone.localdate(self.submitted_at)
        return submitted_date > due
