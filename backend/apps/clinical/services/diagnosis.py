from django.core.exceptions import ValidationError

from apps.clinical.models import ClinicalEncounter, Diagnosis


def create_diagnosis(
    *,
    encounter: ClinicalEncounter,
    diagnosis: str,
    description: str = "",
    diagnosis_type: str = Diagnosis.DiagnosisType.PRIMARY,
    notes: str = "",
) -> Diagnosis:
    if not encounter:
        raise ValidationError("Clinical encounter is required.")

    appointment = encounter.appointment

    if appointment.status != appointment.Status.IN_PROGRESS:
        raise ValidationError(
            "Diagnosis can only be added during an active consultation."
        )

    return Diagnosis.objects.create(
        encounter=encounter,
        diagnosis=diagnosis,
        description=description,
        diagnosis_type=diagnosis_type,
        notes=notes,
    )