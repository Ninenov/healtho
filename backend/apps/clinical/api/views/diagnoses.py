from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.models import ClinicalEncounter, Diagnosis
from apps.clinical.services.diagnosis import create_diagnosis


class DiagnosisListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_encounter(self, request, encounter_id):
        try:
            encounter = ClinicalEncounter.objects.select_related(
                "appointment",
                "doctor",
                "patient",
            ).get(id=encounter_id)
        except ClinicalEncounter.DoesNotExist:
            return None

        if encounter.doctor.user_id != request.user.id:
            return None

        return encounter

    def get(self, request, encounter_id):
        encounter = self.get_encounter(request, encounter_id)

        if not encounter:
            return Response(
                {"detail": "Clinical encounter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        diagnoses = Diagnosis.objects.filter(
            encounter=encounter
        ).order_by("-created_at")

        data = [
            {
                "id": diagnosis.id,
                "diagnosis": diagnosis.diagnosis,
                "description": diagnosis.description,
                "diagnosis_type": diagnosis.diagnosis_type,
                "notes": diagnosis.notes,
            }
            for diagnosis in diagnoses
        ]

        return Response(data)

    def post(self, request, encounter_id):
        encounter = self.get_encounter(request, encounter_id)

        if not encounter:
            return Response(
                {"detail": "Clinical encounter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        diagnosis = request.data.get("diagnosis")

        if not diagnosis:
            return Response(
                {"detail": "Diagnosis is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            diagnosis_obj = create_diagnosis(
                encounter=encounter,
                diagnosis=diagnosis,
                description=request.data.get("description", ""),
                diagnosis_type=request.data.get(
                    "diagnosis_type",
                    Diagnosis.DiagnosisType.PRIMARY,
                ),
                notes=request.data.get("notes", ""),
            )
        except Exception as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "id": diagnosis_obj.id,
                "diagnosis": diagnosis_obj.diagnosis,
                "description": diagnosis_obj.description,
                "diagnosis_type": diagnosis_obj.diagnosis_type,
                "notes": diagnosis_obj.notes,
            },
            status=status.HTTP_201_CREATED,
        )