from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.services.history import ClinicalHistoryService
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class PatientClinicalHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        doctor = get_object_or_404(
            Doctor,
            user=request.user,
        )

        patient = get_object_or_404(
            Patient,
            id=patient_id,
        )

        history = ClinicalHistoryService.get_patient_history(
            doctor=doctor,
            patient=patient,
        )

        if history is None:
            return Response(
                {
                    "detail": (
                        "You do not have clinical access "
                        "to this patient."
                    )
                },
                status=403,
            )

        return Response(
            {
                "patient_id": str(patient.id),
                "history": history,
            }
        )