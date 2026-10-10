from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.doctors.api.serializers.availability import (
    DoctorAvailabilitySerializer,
)
from apps.doctors.models import DoctorAvailability


class DoctorPatientAvailabilityView(
    generics.ListAPIView
):
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorAvailabilitySerializer

    def get_queryset(self):
        doctor_id = self.kwargs["doctor_id"]

        return (
            DoctorAvailability.objects
            .filter(
                doctor_id=doctor_id,
                is_active=True,
            )
            .select_related("doctor")
            .order_by(
                "weekday",
                "start_time",
            )
        )