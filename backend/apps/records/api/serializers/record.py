
from pathlib import Path

from rest_framework import serializers

from apps.records.models import MedicalRecord


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_uid = serializers.CharField(
        source="patient.healthos_uid",
        read_only=True,
    )

    document = serializers.FileField(
        required=False,
        allow_null=True,
        write_only=True,
    )

    document_url = serializers.SerializerMethodField()

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
            "document",
            "document_url",
            "original_filename",
            "mime_type",
            "file_size",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "patient",
            "patient_uid",
            "document_url",
            "original_filename",
            "mime_type",
            "file_size",
            "created_at",
            "updated_at",
        ]

    def validate_document(self, value):
        if value is None:
            return value

        allowed_types = {
            "application/pdf",
            "image/jpeg",
            "image/png",
        }

        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                "File size must not exceed 10 MB."
            )

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Only PDF, JPEG and PNG files are allowed."
            )

        extension = Path(value.name).suffix.lower()
        allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png"}

        if extension not in allowed_extensions:
            raise serializers.ValidationError(
                "Unsupported file extension."
            )

        return value

    def create(self, validated_data):
        document = validated_data.get("document")

        if document:
            validated_data["original_filename"] = Path(
                document.name
            ).name
            validated_data["mime_type"] = document.content_type
            validated_data["file_size"] = document.size

        return super().create(validated_data)

    def update(self, instance, validated_data):
        document = validated_data.get("document")

        if document:
            validated_data["original_filename"] = Path(
                document.name
            ).name
            validated_data["mime_type"] = document.content_type
            validated_data["file_size"] = document.size

        return super().update(instance, validated_data)

    def get_document_url(self, obj):
        # Files must be served through an authenticated endpoint.
        return None
