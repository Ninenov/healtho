from django.core.exceptions import ValidationError

from apps.clinical.models import ClinicalEncounter, FollowUpAction


def create_follow_up_action(
    *,
    encounter: ClinicalEncounter,
    action_type: str,
    description: str,
    due_date=None,
    notes: str = "",
) -> FollowUpAction:
    if not encounter:
        raise ValidationError("Clinical encounter is required.")

    if not description:
        raise ValidationError("Follow-up description is required.")

    appointment = encounter.appointment

    if appointment.status != appointment.Status.IN_PROGRESS:
        raise ValidationError(
            "Follow-up action can only be added during an active consultation."
        )

    return FollowUpAction.objects.create(
        encounter=encounter,
        action_type=action_type,
        description=description,
        due_date=due_date,
        notes=notes,
    )