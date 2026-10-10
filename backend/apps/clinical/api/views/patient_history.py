from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.api.serializers import (
    ClinicalEncounterContextSerializer,
)
from apps.clinical.models.models import ClinicalEncounter
from apps.patients.selectors.patient import get_patient_by_user


class PatientOwnClinicalHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient = get_patient_by_user(request.user)

        if patient is None:
            return Response(
                {"detail": "Patient profile not found."},
                status=404,
            )

        encounters = (
            ClinicalEncounter.objects
            .filter(patient=patient)
            .select_related("doctor", "appointment")
            .prefetch_related(
                "diagnoses",
                "prescriptions",
                "follow_up_actions",
            )
            .order_by("-created_at")
        )

        serializer = ClinicalEncounterContextSerializer(
            encounters,
            many=True,
        )

        return Response(serializer.data)
