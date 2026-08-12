from rest_framework import serializers

from apps.emergency.models import EmergencyContact


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = (
            "id",
            "name",
            "phone",
            "relationship",
            "is_primary",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )