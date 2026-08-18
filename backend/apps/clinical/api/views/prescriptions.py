from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.models.models import ClinicalEncounter, Prescription
from apps.clinical.services.prescription import create_prescription


class PrescriptionListCreateView(APIView):
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

        prescriptions = Prescription.objects.filter(
            encounter=encounter
        ).order_by("-created_at")

        data = [
            {
                "id": prescription.id,
                "medication": prescription.medication,
                "dosage": prescription.dosage,
                "frequency": prescription.frequency,
                "duration": prescription.duration,
                "route": prescription.route,
                "instructions": prescription.instructions,
            }
            for prescription in prescriptions
        ]

        return Response(data)

    def post(self, request, encounter_id):
        encounter = self.get_encounter(request, encounter_id)

        if not encounter:
            return Response(
                {"detail": "Clinical encounter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        required_fields = [
            "medication",
            "dosage",
            "frequency",
            "duration",
        ]

        missing_fields = [
            field
            for field in required_fields
            if not request.data.get(field)
        ]

        if missing_fields:
            return Response(
                {
                    "detail": "Required fields are missing.",
                    "fields": missing_fields,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            prescription = create_prescription(
                encounter=encounter,
                doctor=encounter.doctor,
                medication=request.data["medication"],
                dosage=request.data["dosage"],
                frequency=request.data["frequency"],
                duration=request.data["duration"],
                route=request.data.get("route", ""),
                instructions=request.data.get("instructions", ""),
            )
        except Exception as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "id": prescription.id,
                "medication": prescription.medication,
                "dosage": prescription.dosage,
                "frequency": prescription.frequency,
                "duration": prescription.duration,
                "route": prescription.route,
                "instructions": prescription.instructions,
            },
            status=status.HTTP_201_CREATED,
        )