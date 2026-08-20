from rest_framework import serializers

from apps.common.models.audit import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor = serializers.UUIDField(
        source="actor.id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "actor",
            "action",
            "target_type",
            "target_id",
            "metadata",
            "created_at",
        )
        read_only_fields = (
            "id",
            "actor",
            "action",
            "target_type",
            "target_id",
            "metadata",
            "created_at",
        )