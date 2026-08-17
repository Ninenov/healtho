from rest_framework import serializers

from apps.clinical.models import (
    Allergy,
    ClinicalEncounter,
    Diagnosis,
    FollowUpAction,
    MedicalCondition,
    Prescription,
)

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

class DiagnosisContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = (
            "id",
            "diagnosis",
            "description",
            "diagnosis_type",
            "notes",
            "created_at",
            "updated_at",
        )


class PrescriptionContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = (
            "id",
            "medication",
            "dosage",
            "frequency",
            "duration",
            "route",
            "instructions",
            "created_at",
            "updated_at",
        )


class FollowUpActionContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUpAction
        fields = (
            "id",
            "action_type",
            "description",
            "due_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        )


class ClinicalEncounterContextSerializer(serializers.ModelSerializer):
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

    diagnoses = DiagnosisContextSerializer(
        many=True,
        read_only=True,
    )

    prescriptions = PrescriptionContextSerializer(
        many=True,
        read_only=True,
    )

    follow_ups = FollowUpActionContextSerializer(
        source="follow_up_actions",
        many=True,
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
            "diagnoses",
            "prescriptions",
            "follow_ups",
            "created_at",
            "updated_at",
        )