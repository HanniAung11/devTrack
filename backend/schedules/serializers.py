from rest_framework import serializers

from batches.models import Batch

from .models import Session


class BatchNestedMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ("id", "batch_name", "status")


class SessionSerializer(serializers.ModelSerializer):
    batch_detail = BatchNestedMiniSerializer(source="batch", read_only=True)

    class Meta:
        model = Session
        fields = (
            "id",
            "batch",
            "batch_detail",
            "session_date",
            "session_type",
            "title",
            "description",
            "is_completed",
            "created_at",
        )


class SessionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = (
            "batch",
            "session_date",
            "session_type",
            "title",
            "description",
            "is_completed",
        )
