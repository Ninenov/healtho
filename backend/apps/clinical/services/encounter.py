from django.core.exceptions import ValidationError
from django.db import transaction

from apps.appointments.models import Appointment
from apps.clinical.events.encounter import EncounterCompleted
from apps.clinical.models.models import (
    ClinicalAuditEvent,
    ClinicalEncounter,
)
from apps.clinical.services.audit import ClinicalAuditService
from apps.common.events.registry import event_registry


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

        ClinicalAuditService.log(
            actor=doctor.user,
            encounter=encounter,
            action=ClinicalAuditEvent.Action.ENCOUNTER_CREATED,
            target_type="ClinicalEncounter",
            target_id=encounter.id,
            metadata={
                "appointment_id": str(appointment.id),
            },
        )

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
        appointment.save(
            update_fields=["status", "updated_at"],
        )

        ClinicalAuditService.log(
            actor=doctor.user,
            encounter=encounter,
            action=ClinicalAuditEvent.Action.ENCOUNTER_COMPLETED,
            target_type="ClinicalEncounter",
            target_id=encounter.id,
            metadata={
                "appointment_id": str(appointment.id),
            },
        )

        event = EncounterCompleted(
            encounter_id=encounter.id,
            patient_id=encounter.patient_id,
            patient_user=encounter.patient.user,
            doctor_id=doctor.id,
            appointment_id=appointment.id,
        )

        event_registry.dispatch(event)

        return encounter