from django.core.exceptions import ValidationError
from django.db import transaction

from apps.appointments.models import Appointment
from apps.clinical.models import ClinicalEncounter


class ClinicalEncounterService:

    @staticmethod
    @transaction.atomic
    def create(
        *,
        appointment,
        doctor,
        chief_complaint="",
        symptoms="",
        examination_findings="",
        assessment="",
        plan="",
        notes="",
    ):
        if appointment.doctor_id != doctor.id:
            raise ValidationError(
                {
                    "doctor": (
                        "You can only create an encounter "
                        "for your own appointment."
                    )
                }
            )

        if appointment.status != Appointment.Status.IN_PROGRESS:
            raise ValidationError(
                {
                    "appointment": (
                        "Clinical encounter can only be created "
                        "during an active consultation."
                    )
                }
            )

        if ClinicalEncounter.objects.filter(
            appointment=appointment,
        ).exists():
            raise ValidationError(
                {
                    "appointment": (
                        "A clinical encounter already exists "
                        "for this appointment."
                    )
                }
            )

        encounter = ClinicalEncounter(
            appointment=appointment,
            patient=appointment.patient,
            doctor=appointment.doctor,
            chief_complaint=chief_complaint,
            symptoms=symptoms,
            examination_findings=examination_findings,
            assessment=assessment,
            plan=plan,
            notes=notes,
        )

        encounter.full_clean()
        encounter.save()

        return encounter

    @staticmethod
    @transaction.atomic
    def complete(
        *,
        encounter,
        doctor,
    ):
        if encounter.doctor_id != doctor.id:
            raise ValidationError(
                {
                    "doctor": (
                        "You can only complete "
                        "your own clinical encounter."
                    )
                }
            )

        appointment = encounter.appointment

        if appointment.status != Appointment.Status.IN_PROGRESS:
            raise ValidationError(
                {
                    "appointment": (
                        "Only an active consultation "
                        "can be completed."
                    )
                }
            )

        appointment.status = Appointment.Status.COMPLETED
        appointment.save(update_fields=["status", "updated_at"])

        return encounter