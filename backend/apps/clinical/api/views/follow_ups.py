from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.models.models import ClinicalEncounter, FollowUpAction
from apps.clinical.services.follow_up import create_follow_up_action


class FollowUpActionListCreateView(APIView):
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

        actions = FollowUpAction.objects.filter(
            encounter=encounter
        ).order_by("-created_at")

        return Response(
            [
                {
                    "id": action.id,
                    "action_type": action.action_type,
                    "description": action.description,
                    "due_date": action.due_date,
                    "status": action.status,
                    "notes": action.notes,
                }
                for action in actions
            ]
        )

    def post(self, request, encounter_id):
        encounter = self.get_encounter(request, encounter_id)

        if not encounter:
            return Response(
                {"detail": "Clinical encounter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not request.data.get("description"):
            return Response(
                {"detail": "Follow-up description is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            action = create_follow_up_action(
                encounter=encounter,
                doctor=encounter.doctor,
                action_type=request.data.get(
                    "action_type",
                    FollowUpAction.ActionType.FOLLOW_UP,
                ),
                description=request.data["description"],
                due_date=request.data.get("due_date"),
                notes=request.data.get("notes", ""),
            )
        except Exception as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "id": action.id,
                "action_type": action.action_type,
                "description": action.description,
                "due_date": action.due_date,
                "status": action.status,
                "notes": action.notes,
            },
            status=status.HTTP_201_CREATED,
        )