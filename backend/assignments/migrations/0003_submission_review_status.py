import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assignments", "0002_alter_submission_github_link"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="submission",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending review"),
                    ("ACCEPTED", "Accepted"),
                    ("REJECTED", "Rejected"),
                ],
                default="PENDING",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="submission",
            name="review_note",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="submission",
            name="reviewed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="submission",
            name="reviewed_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="reviewed_submissions",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="submission",
            name="submitted_at",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
