from django.core.exceptions import ValidationError
from django.db import transaction

from apps.clinical.models.models import (
    ClinicalAuditEvent,
    ClinicalEncounter,
    Prescription,
)
from apps.clinical.services.audit import ClinicalAuditService


@transaction.atomic
def create_prescription(
    *,
    encounter: ClinicalEncounter,
    doctor,
    medication: str,
    dosage: str,
    frequency: str,
    duration: str,
    route: str = "",
    instructions: str = "",
) -> Prescription:
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
            "You can only add a prescription to your own encounter."
        )

    appointment = encounter.appointment

    if appointment.status != appointment.Status.IN_PROGRESS:
        raise ValidationError(
            "Prescription can only be added during an active consultation."
        )

    prescription = Prescription.objects.create(
        encounter=encounter,
        medication=medication,
        dosage=dosage,
        frequency=frequency,
        duration=duration,
        route=route,
        instructions=instructions,
    )

    ClinicalAuditService.log(
        actor=doctor.user,
        encounter=encounter,
        action=ClinicalAuditEvent.Action.PRESCRIPTION_CREATED,
        target_type="Prescription",
        target_id=prescription.id,
        metadata={
            "medication": medication,
            "dosage": dosage,
            "frequency": frequency,
            "duration": duration,
        },
    )

    return prescription