from django.conf import settings
from django.db import models

from batches.models import Batch


class Developer(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="developer_profile",
    )
    developer_code = models.CharField(max_length=32, unique=True, blank=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="developers",
    )
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["developer_code"]

    def __str__(self) -> str:
        return f"{self.developer_code} — {self.full_name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.developer_code:
            code = f"DEV-{self.id:03d}"
            Developer.objects.filter(pk=self.pk).update(developer_code=code)
            self.developer_code = code
