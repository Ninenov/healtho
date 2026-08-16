from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.api.serializers import AppointmentSerializer
from apps.appointments.models import Appointment
from apps.appointments.services.appointment import AppointmentService
from apps.patients.selectors.patient import get_patient_by_user


class AppointmentCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        patient = get_patient_by_user(request.user)

        if patient is None:
            return Response(
                {"detail": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        appointment = (
            Appointment.objects
            .filter(
                id=appointment_id,
                patient=patient,
            )
            .first()
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            appointment = AppointmentService.cancel(
                appointment=appointment,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK,
        )

class AppointmentConfirmView(APIView):
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
            .first()
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            appointment = AppointmentService.confirm(
                appointment=appointment,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK,
        )

class AppointmentStartView(APIView):
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
            .first()
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            appointment = AppointmentService.start(
                appointment=appointment,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK,
        )


class AppointmentCompleteView(APIView):
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
            .first()
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            appointment = AppointmentService.complete(
                appointment=appointment,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK,
        )


class AppointmentNoShowView(APIView):
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
            .first()
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            appointment = AppointmentService.no_show(
                appointment=appointment,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK,
        )