from rest_framework import serializers

from apps.clinical.models import Allergy, MedicalCondition, ClinicalEncounter


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = (
            "id",
            "allergen",
            "reaction",
            "severity",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

class MedicalConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalCondition
        fields = (
            "id",
            "name",
            "diagnosed_on",
            "status",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

class ClinicalEncounterSerializer(serializers.ModelSerializer):
    patient = serializers.UUIDField(
        source="patient.id",
        read_only=True,
    )

    doctor = serializers.UUIDField(
        source="doctor.id",
        read_only=True,
    )

    appointment = serializers.UUIDField(
        source="appointment.id",
        read_only=True,
    )

    class Meta:
        model = ClinicalEncounter
        fields = (
            "id",
            "appointment",
            "patient",
            "doctor",
            "chief_complaint",
            "symptoms",
            "examination_findings",
            "assessment",
            "plan",
            "notes",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "appointment",
            "patient",
            "doctor",
            "created_at",
            "updated_at",
        )