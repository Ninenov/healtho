from django.core.exceptions import ValidationError
from django.db import transaction

from apps.appointments.models import Appointment
from apps.appointments.services.scheduling import SchedulingService
from apps.appointments.events.appointment import AppointmentCreated
from apps.common.events.registry import event_registry


class AppointmentService:

    @staticmethod
    @transaction.atomic
    def create(
        *,
        patient,
        doctor,
        appointment_type,
        scheduled_at,
        reason="",
        notes="",
    ):
        appointment = Appointment(
            patient=patient,
            doctor=doctor,
            appointment_type=appointment_type,
            scheduled_at=scheduled_at,
            reason=reason,
            notes=notes,
        )

        appointment.full_clean()

        SchedulingService.validate_slot(
            doctor=doctor,
            scheduled_at=scheduled_at,
        )

        appointment.save()

        event = AppointmentCreated(
            appointment_id=appointment.id,
            patient_id=appointment.patient_id,
            patient_user=appointment.patient.user,
            doctor_id=appointment.doctor_id,
            scheduled_at=appointment.scheduled_at,
            appointment_type=appointment.appointment_type,
        )

        event_registry.dispatch(event)

        return appointment

    @staticmethod
    @transaction.atomic
    def confirm(*, appointment):
        AppointmentService._transition(
            appointment=appointment,
            allowed_from=[
                Appointment.Status.SCHEDULED,
            ],
            new_status=Appointment.Status.CONFIRMED,
        )

        return appointment

    @staticmethod
    @transaction.atomic
    def start(*, appointment):
        AppointmentService._transition(
            appointment=appointment,
            allowed_from=[
                Appointment.Status.CONFIRMED,
            ],
            new_status=Appointment.Status.IN_PROGRESS,
        )

        return appointment

    @staticmethod
    @transaction.atomic
    def complete(*, appointment):
        AppointmentService._transition(
            appointment=appointment,
            allowed_from=[
                Appointment.Status.IN_PROGRESS,
            ],
            new_status=Appointment.Status.COMPLETED,
        )

        return appointment

    @staticmethod
    @transaction.atomic
    def cancel(*, appointment):
        AppointmentService._transition(
            appointment=appointment,
            allowed_from=[
                Appointment.Status.SCHEDULED,
                Appointment.Status.CONFIRMED,
            ],
            new_status=Appointment.Status.CANCELLED,
        )

        return appointment

    @staticmethod
    @transaction.atomic
    def no_show(*, appointment):
        AppointmentService._transition(
            appointment=appointment,
            allowed_from=[
                Appointment.Status.CONFIRMED,
            ],
            new_status=Appointment.Status.NO_SHOW,
        )

        return appointment

    @staticmethod
    def _transition(*, appointment, allowed_from, new_status):
        if appointment.status not in allowed_from:
            raise ValidationError(
                {
                    "status": (
                        f"Cannot change appointment status from "
                        f"{appointment.status} to {new_status}."
                    )
                }
            )

        appointment.status = new_status
        appointment.save(
            update_fields=["status", "updated_at"]
        )