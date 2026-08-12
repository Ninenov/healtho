from rest_framework import serializers

from apps.clinical.models import Allergy, MedicalCondition


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