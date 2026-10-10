from rest_framework import serializers

from apps.doctors.models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )

    class Meta:
        model = Doctor
        fields = (
            "id",
            "first_name",
            "last_name",
            "specialization",
            "qualification",
            "license_number",
        )

        read_only_fields = fields