from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.models.models import ClinicalAuditEvent
from apps.clinical.services.audit import ClinicalAuditService


class ClinicalAuditListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = getattr(request.user, "doctor_profile", None)

        if not doctor:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        encounter_id = request.query_params.get("encounter_id")
        action = request.query_params.get("action")

        queryset = ClinicalAuditService.for_doctor(
            doctor=doctor,
        )

        if encounter_id:
            queryset = queryset.filter(
                encounter_id=encounter_id,
            )

        if action:
            if action not in ClinicalAuditEvent.Action.values:
                return Response(
                    {"detail": "Invalid audit action."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            queryset = queryset.filter(
                action=action,
            )

        data = [
            {
                "id": event.id,
                "encounter_id": event.encounter_id,
                "actor_id": event.actor_id,
                "action": event.action,
                "target_type": event.target_type,
                "target_id": event.target_id,
                "metadata": event.metadata,
                "created_at": event.created_at,
            }
            for event in queryset
        ]

        return Response(data)