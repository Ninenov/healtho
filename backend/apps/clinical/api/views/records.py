from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.models import Appointment
from apps.clinical.services.records import ClinicalRecordService
from apps.records.api.serializers import MedicalRecordSerializer


class AppointmentClinicalRecordCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        try:
            doctor = request.user.doctor_profile
        except AttributeError:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        appointment = (
            Appointment.objects
            .filter(
                id=appointment_id,
                doctor=doctor,
            )
            .select_related("patient", "doctor")
            .first()
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = MedicalRecordSerializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        try:
            record = ClinicalRecordService.create_from_appointment(
                appointment=appointment,
                doctor=doctor,
                **serializer.validated_data,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            MedicalRecordSerializer(record).data,
            status=status.HTTP_201_CREATED,
        )