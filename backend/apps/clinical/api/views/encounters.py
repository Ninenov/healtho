from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.models import Appointment
from apps.clinical.api.serializers import ClinicalEncounterSerializer
from apps.clinical.models.models import ClinicalEncounter
from apps.clinical.services.encounter import ClinicalEncounterService


class ClinicalEncounterView(APIView):
    permission_classes = [IsAuthenticated]

    def get_doctor(self, request):
        try:
            return request.user.doctor_profile
        except AttributeError:
            return None

    def get_appointment(self, request, appointment_id):
        doctor = self.get_doctor(request)

        if doctor is None:
            return None, None

        appointment = (
            Appointment.objects
            .select_related("patient", "doctor")
            .filter(
                id=appointment_id,
                doctor=doctor,
            )
            .first()
        )

        return doctor, appointment

    def get(self, request, appointment_id):
        doctor, appointment = self.get_appointment(
            request,
            appointment_id,
        )

        if doctor is None:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        encounter = (
            ClinicalEncounter.objects
            .filter(appointment=appointment)
            .first()
        )

        if encounter is None:
            return Response(
                {"detail": "Clinical encounter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            ClinicalEncounterSerializer(encounter).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request, appointment_id):
        doctor, appointment = self.get_appointment(
            request,
            appointment_id,
        )

        if doctor is None:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ClinicalEncounterSerializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        try:
            encounter = ClinicalEncounterService.create(
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
            ClinicalEncounterSerializer(encounter).data,
            status=status.HTTP_201_CREATED,
        )
