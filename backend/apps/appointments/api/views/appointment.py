from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.api.serializers import AppointmentSerializer
from apps.appointments.models import Appointment
from apps.patients.selectors.patient import get_patient_by_user


class AppointmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient = get_patient_by_user(request.user)

        if patient is None:
            return Response(
                {"detail": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        appointments = (
            Appointment.objects
            .filter(patient=patient)
            .select_related("doctor", "doctor__user")
            .order_by("-scheduled_at")
        )

        serializer = AppointmentSerializer(
            appointments,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        patient = get_patient_by_user(request.user)

        if patient is None:
            return Response(
                {"detail": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AppointmentSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        appointment = serializer.save(
            patient=patient,
        )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, appointment_id):
        patient = get_patient_by_user(request.user)

        if patient is None:
            return None

        return (
            Appointment.objects
            .filter(
                id=appointment_id,
                patient=patient,
            )
            .select_related("doctor", "doctor__user")
            .first()
        )

    def get(self, request, appointment_id):
        appointment = self.get_object(
            request,
            appointment_id,
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AppointmentSerializer(appointment)

        return Response(serializer.data)

    def patch(self, request, appointment_id):
        appointment = self.get_object(
            request,
            appointment_id,
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AppointmentSerializer(
            appointment,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        appointment = serializer.save()

        return Response(
            AppointmentSerializer(appointment).data,
        )

    def delete(self, request, appointment_id):
        appointment = self.get_object(
            request,
            appointment_id,
        )

        if appointment is None:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        appointment.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )