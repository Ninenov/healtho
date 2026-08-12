from rest_framework import serializers

from apps.patients.models import Patient


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = (
            "id",
            "healthos_uid",
            "date_of_birth",
            "gender",
            "blood_group",
            "height_cm",
            "weight_kg",
            "profile_photo",
        )