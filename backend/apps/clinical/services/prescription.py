from django.core.exceptions import ValidationError

from apps.clinical.models import ClinicalEncounter, Prescription


def create_prescription(
    *,
    encounter: ClinicalEncounter,
    medication: str,
    dosage: str,
    frequency: str,
    duration: str,
    route: str = "",
    instructions: str = "",
) -> Prescription:
    if not encounter:
        raise ValidationError("Clinical encounter is required.")

    appointment = encounter.appointment

    if appointment.status != appointment.Status.IN_PROGRESS:
        raise ValidationError(
            "Prescription can only be added during an active consultation."
        )

    return Prescription.objects.create(
        encounter=encounter,
        medication=medication,
        dosage=dosage,
        frequency=frequency,
        duration=duration,
        route=route,
        instructions=instructions,
    )