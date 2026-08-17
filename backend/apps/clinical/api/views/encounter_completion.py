from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.api.serializers import ClinicalEncounterSerializer
from apps.clinical.models import ClinicalEncounter
from apps.clinical.services.encounter import ClinicalEncounterService


class ClinicalEncounterCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, encounter_id):
        try:
            doctor = request.user.doctor_profile
        except AttributeError:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        encounter = (
            ClinicalEncounter.objects
            .select_related(
                "appointment",
                "doctor",
            )
            .filter(
                id=encounter_id,
                doctor=doctor,
            )
            .first()
        )

        if encounter is None:
            return Response(
                {"detail": "Clinical encounter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            ClinicalEncounterService.complete(
                encounter=encounter,
                doctor=doctor,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ClinicalEncounterSerializer(encounter).data,
            status=status.HTTP_200_OK,
        )