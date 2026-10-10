from rest_framework import serializers

from apps.appointments.models import Appointment
from apps.doctors.models import Doctor


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
    )

    patient = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    patient_uid = serializers.CharField(
        source="patient.healthos_uid",
        read_only=True,
    )

    patient_name = serializers.SerializerMethodField()

    def get_patient_name(self, obj):
        user = obj.patient.user

        return (
            f"{user.first_name} {user.last_name}"
        ).strip() or "Patient"

    class Meta:
        model = Appointment

        fields = [
            "id",
            "patient",
            "patient_uid",
            "patient_name",
            "doctor",
            "appointment_type",
            "scheduled_at",
            "status",
            "reason",
            "notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "patient_uid",
            "patient_name",
            "status",
            "created_at",
            "updated_at",
        ]