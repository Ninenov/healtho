from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from apps.doctors.api.serializers.availability import (
    DoctorAvailabilitySerializer,
)
from apps.doctors.models import DoctorAvailability


class DoctorPublicAvailabilityView(ListAPIView):
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            DoctorAvailability.objects
            .filter(
                doctor_id=self.kwargs["doctor_id"],
                is_active=True,
            )
            .order_by(
                "weekday",
                "start_time",
            )
        )