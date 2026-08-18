from django.core.exceptions import ValidationError
from django.db import transaction

from apps.clinical.models.models import (
    ClinicalAuditEvent,
    ClinicalEncounter,
    Diagnosis,
)
from apps.clinical.services.audit import ClinicalAuditService


@transaction.atomic
def create_diagnosis(
    *,
    encounter: ClinicalEncounter,
    doctor,
    diagnosis: str,
    description: str = "",
    diagnosis_type: str = Diagnosis.DiagnosisType.PRIMARY,
    notes: str = "",
) -> Diagnosis:
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
            "You can only add a diagnosis to your own encounter."
        )

    appointment = encounter.appointment

    if appointment.status != appointment.Status.IN_PROGRESS:
        raise ValidationError(
            "Diagnosis can only be added during an active consultation."
        )

    diagnosis_obj = Diagnosis.objects.create(
        encounter=encounter,
        diagnosis=diagnosis,
        description=description,
        diagnosis_type=diagnosis_type,
        notes=notes,
    )

    ClinicalAuditService.log(
        actor=doctor.user,
        encounter=encounter,
        action=ClinicalAuditEvent.Action.DIAGNOSIS_CREATED,
        target_type="Diagnosis",
        target_id=diagnosis_obj.id,
        metadata={
            "diagnosis_type": diagnosis_type,
        },
    )

    return diagnosis_obj