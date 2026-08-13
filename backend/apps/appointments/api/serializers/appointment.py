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

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
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
            "status",
            "created_at",
            "updated_at",
        ]