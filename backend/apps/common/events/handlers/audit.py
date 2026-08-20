from apps.appointments.events.appointment import AppointmentCreated
from apps.appointments.events.status import (
    AppointmentCancelled,
    AppointmentConfirmed,
)
from apps.common.models.audit import AuditLog
from apps.common.services.audit import AuditService


def handle_appointment_created(
    event: AppointmentCreated,
) -> None:
    AuditService.log(
        actor=event.patient_user,
        action=AuditLog.Action.CREATED,
        target_type="Appointment",
        target_id=event.appointment_id,
        metadata={
            "patient_id": str(event.patient_id),
            "doctor_id": str(event.doctor_id),
            "scheduled_at": (
                event.scheduled_at.isoformat()
                if event.scheduled_at
                else None
            ),
            "appointment_type": event.appointment_type,
        },
    )


def handle_appointment_confirmed(
    event: AppointmentConfirmed,
) -> None:
    AuditService.log(
        actor=event.patient_user,
        action=AuditLog.Action.CONFIRMED,
        target_type="Appointment",
        target_id=event.appointment_id,
        metadata={
            "patient_id": str(event.patient_id),
            "doctor_id": str(event.doctor_id),
            "scheduled_at": (
                event.scheduled_at.isoformat()
                if event.scheduled_at
                else None
            ),
            "appointment_type": event.appointment_type,
        },
    )


def handle_appointment_cancelled(
    event: AppointmentCancelled,
) -> None:
    AuditService.log(
        actor=event.patient_user,
        action=AuditLog.Action.CANCELLED,
        target_type="Appointment",
        target_id=event.appointment_id,
        metadata={
            "patient_id": str(event.patient_id),
            "doctor_id": str(event.doctor_id),
            "scheduled_at": (
                event.scheduled_at.isoformat()
                if event.scheduled_at
                else None
            ),
            "appointment_type": event.appointment_type,
        },
    )