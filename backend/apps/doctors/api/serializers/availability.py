from rest_framework import serializers

from apps.doctors.models import DoctorAvailability


class DoctorAvailabilitySerializer(serializers.ModelSerializer):

    class Meta:
        model = DoctorAvailability
        fields = [
            "id",
            "doctor",
            "weekday",
            "start_time",
            "end_time",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "doctor",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                {
                    "end_time": (
                        "End time must be later than start time."
                    )
                }
            )

        return attrs