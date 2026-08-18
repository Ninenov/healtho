from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.api.serializers import (
    AllergySerializer,
    MedicalConditionSerializer,
)
from apps.clinical.models.models import Allergy, MedicalCondition
from apps.clinical.selectors.access import (
    doctor_has_patient_access,
)
from apps.patients.models import Patient
from apps.records.api.serializers import MedicalRecordSerializer
from apps.records.models import MedicalRecord


class DoctorPatientClinicalView(APIView):
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
                {"detail": "You do not have access to this patient."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not doctor_has_patient_access(
            doctor=doctor,
            patient=patient,
        ):
            return Response(
                {"detail": "You do not have access to this patient."},
                status=status.HTTP_404_NOT_FOUND,
            )

        allergies = Allergy.objects.filter(
            patient=patient,
        )

        conditions = MedicalCondition.objects.filter(
            patient=patient,
        )

        records = (
            MedicalRecord.objects
            .filter(patient=patient)
            .order_by(
                "-record_date",
                "-created_at",
            )
        )

        return Response(
            {
                "patient": str(patient.id),
                "allergies": AllergySerializer(
                    allergies,
                    many=True,
                ).data,
                "medical_conditions": MedicalConditionSerializer(
                    conditions,
                    many=True,
                ).data,
                "medical_records": MedicalRecordSerializer(
                    records,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )
