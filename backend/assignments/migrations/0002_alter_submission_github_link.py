from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assignments", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="submission",
            name="github_link",
            field=models.CharField(max_length=500),
        ),
    ]
