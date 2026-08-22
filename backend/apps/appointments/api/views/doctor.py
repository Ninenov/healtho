from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.api.serializers import AppointmentSerializer
from apps.appointments.models import Appointment


class DoctorAppointmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            doctor = request.user.doctor_profile
        except AttributeError:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        appointments = (
            Appointment.objects
            .filter(doctor=doctor)
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
            )
            .order_by("-scheduled_at")
        )

        return Response(
            AppointmentSerializer(
                appointments,
                many=True,
            ).data,
            status=status.HTTP_200_OK,
        )