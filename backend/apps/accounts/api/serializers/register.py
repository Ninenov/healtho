from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import User
from apps.accounts.constants.user_roles import UserRole
from apps.doctors.models import Doctor
from apps.patients.services.patient import create_patient_profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    role = serializers.ChoiceField(
        choices=[
            UserRole.PATIENT,
            UserRole.DOCTOR,
        ],
        write_only=True,
        default=UserRole.PATIENT,
    )

    specialization = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
    )

    qualification = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
    )

    license_number = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
    )

    class Meta:
        model = User
        fields = (
            "phone",
            "password",
            "first_name",
            "last_name",
            "email",
            "role",
            "specialization",
            "qualification",
            "license_number",
        )

    def validate(self, attrs):
        role = attrs.get("role", UserRole.PATIENT)

        if role == UserRole.DOCTOR:
            if not attrs.get("specialization"):
                raise serializers.ValidationError(
                    {
                        "specialization": (
                            "Specialization is required for doctors."
                        )
                    }
                )

            if not attrs.get("qualification"):
                raise serializers.ValidationError(
                    {
                        "qualification": (
                            "Qualification is required for doctors."
                        )
                    }
                )

            if not attrs.get("license_number"):
                raise serializers.ValidationError(
                    {
                        "license_number": (
                            "License number is required for doctors."
                        )
                    }
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop(
            "role",
            UserRole.PATIENT,
        )

        specialization = validated_data.pop(
            "specialization",
            "",
        )

        qualification = validated_data.pop(
            "qualification",
            "",
        )

        license_number = validated_data.pop(
            "license_number",
            "",
        )

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            role=role,
            **validated_data,
        )

        if role == UserRole.PATIENT:
            create_patient_profile(user)

        elif role == UserRole.DOCTOR:
            Doctor.objects.create(
                user=user,
                specialization=specialization,
                qualification=qualification,
                license_number=license_number,
                verification_status=(
                    Doctor.VerificationStatus.PENDING
                ),
            )

        return user