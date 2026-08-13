from rest_framework import serializers

from apps.records.models import MedicalRecord


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_uid = serializers.CharField(
        source="patient.healthos_uid",
        read_only=True,
    )

    class Meta:
        model = MedicalRecord
        fields = [
            "id",
            "patient",
            "patient_uid",
            "record_type",
            "title",
            "description",
            "record_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "patient",
            "patient_uid",
            "created_at",
            "updated_at",
        ]