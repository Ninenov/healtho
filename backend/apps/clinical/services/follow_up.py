from django.core.exceptions import ValidationError
from django.db import transaction

from apps.clinical.events.follow_up import FollowUpCreated
from apps.clinical.models.models import (
    ClinicalAuditEvent,
    ClinicalEncounter,
    FollowUpAction,
)
from apps.clinical.services.audit import ClinicalAuditService
from apps.common.events.registry import event_registry


@transaction.atomic
def create_follow_up_action(
    *,
    encounter: ClinicalEncounter,
    doctor,
    action_type: str,
    description: str,
    due_date=None,
    notes: str = "",
) -> FollowUpAction:
    if not encounter:
        raise ValidationError(
            "Clinical encounter is required."
        )

    if not doctor:
        raise ValidationError(
            "Doctor is required."
        )

    if encounter.doctor_id != doctor.id:
        raise ValidationError(
            "You can only add a follow-up to your own encounter."
        )

    if not description:
        raise ValidationError(
            "Follow-up description is required."
        )

    appointment = encounter.appointment

    if appointment.status != appointment.Status.IN_PROGRESS:
        raise ValidationError(
            "Follow-up action can only be added during an active consultation."
        )

    action = FollowUpAction.objects.create(
        encounter=encounter,
        action_type=action_type,
        description=description,
        due_date=due_date,
        notes=notes,
    )

    ClinicalAuditService.log(
        actor=doctor.user,
        encounter=encounter,
        action=ClinicalAuditEvent.Action.FOLLOW_UP_CREATED,
        target_type="FollowUpAction",
        target_id=action.id,
        metadata={
            "action_type": action_type,
            "due_date": str(due_date) if due_date else None,
        },
    )

    event = FollowUpCreated(
        follow_up_id=action.id,
        encounter_id=encounter.id,
        patient_id=encounter.patient_id,
        patient_user=encounter.patient.user,
        doctor_id=doctor.id,
        due_date=due_date,
        description=description,
        target="FollowUpAction",
    )

    event_registry.dispatch(event)

    return action