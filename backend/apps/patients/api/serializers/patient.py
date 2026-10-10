from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from apps.patients.models import Patient, PatientAddress


User = get_user_model()


class PatientAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientAddress
        fields = (
            "address_line_1",
            "address_line_2",
            "city",
            "district",
            "state",
            "postal_code",
            "country",
        )


class PatientSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        source="user.first_name",
        required=False,
        allow_blank=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
        allow_blank=True,
    )

    email = serializers.EmailField(
        source="user.email",
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    phone = serializers.CharField(
        source="user.phone",
        read_only=True,
    )

    address = PatientAddressSerializer(
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Patient
        fields = (
            "id",
            "healthos_uid",
            "first_name",
            "last_name",
            "email",
            "phone",
            "date_of_birth",
            "gender",
            "blood_group",
            "height_cm",
            "weight_kg",
            "profile_photo",
            "address",
        )

        read_only_fields = (
            "id",
            "healthos_uid",
            "phone",
        )

    def validate(self, attrs):
        user_data = attrs.get("user", {})

        if "email" in user_data:
            email = user_data["email"]

            if email:
                current_user = (
                    self.instance.user
                    if self.instance
                    else None
                )

                existing_user = (
                    User.objects
                    .filter(email__iexact=email)
                    .first()
                )

                if (
                    existing_user is not None
                    and (
                        current_user is None
                        or existing_user.pk != current_user.pk
                    )
                ):
                    raise serializers.ValidationError(
                        {
                            "email": (
                                "This email address is already "
                                "associated with another account."
                            )
                        }
                    )

        return attrs
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)

        try:
            address = instance.address
            representation["address"] = PatientAddressSerializer(
                address,
            ).data
        except PatientAddress.DoesNotExist:
            representation["address"] = None

        return representation

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        address_data = validated_data.pop("address", None)

        user = instance.user

        # Only update User fields that actually changed.
        changed_user_fields = []

        for field, value in user_data.items():
            current_value = getattr(user, field)

            if current_value != value:
                setattr(user, field, value)
                changed_user_fields.append(field)

        if changed_user_fields:
            user.save(
                update_fields=changed_user_fields,
            )

        # Update Patient fields.
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        # Create or update address.
        if address_data is not None:
            PatientAddress.objects.update_or_create(
                patient=instance,
                defaults=address_data,
            )

        return instance