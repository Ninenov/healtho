from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.patients.models import Patient
from apps.records.api.serializers import MedicalRecordSerializer
from apps.records.selectors.record import (
    get_patient_medical_records_for_doctor,
)


class DoctorPatientMedicalRecordsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        try:
            doctor = request.user.doctor_profile
        except AttributeError:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        patient = (
            Patient.objects
            .filter(id=patient_id)
            .first()
        )

        if patient is None:
            return Response(
                {"detail": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        records = get_patient_medical_records_for_doctor(
            doctor=doctor,
            patient=patient,
        )

        if not records.exists():
            return Response(
                {"detail": "You do not have access to this patient."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            MedicalRecordSerializer(
                records,
                many=True,
            ).data,
            status=status.HTTP_200_OK,
        )