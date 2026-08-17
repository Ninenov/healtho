from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.api.serializers import (
    AllergySerializer,
    ClinicalEncounterContextSerializer,
    MedicalConditionSerializer,
)
from apps.clinical.services.context import ClinicalContextService
from apps.patients.models import Patient
from apps.records.api.serializers import MedicalRecordSerializer


class PatientClinicalContextView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        try:
            doctor = request.user.doctor_profile
        except AttributeError:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        patient = Patient.objects.filter(
            id=patient_id,
        ).first()

        if patient is None:
            return Response(
                {"detail": "You do not have access to this patient."},
                status=status.HTTP_404_NOT_FOUND,
            )

        context = ClinicalContextService.get_patient_context(
            doctor=doctor,
            patient=patient,
        )

        if context is None:
            return Response(
                {"detail": "You do not have access to this patient."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "patient": str(patient.id),
                "allergies": AllergySerializer(
                    context["allergies"],
                    many=True,
                ).data,
                "medical_conditions": MedicalConditionSerializer(
                    context["medical_conditions"],
                    many=True,
                ).data,
                "medical_records": MedicalRecordSerializer(
                    context["medical_records"],
                    many=True,
                ).data,
                "encounters": ClinicalEncounterContextSerializer(
                    context["encounters"],
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )