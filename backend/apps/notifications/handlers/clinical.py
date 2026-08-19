from apps.clinical.events.follow_up import FollowUpCreated
from apps.notifications.models import Notification
from apps.notifications.services import create_notification
from apps.clinical.events.encounter import EncounterCompleted
from apps.appointments.events.appointment import AppointmentCreated
from apps.appointments.events.status import AppointmentConfirmed
from apps.appointments.events.status import AppointmentCancelled
from apps.appointments.events.status import AppointmentReminderDue

def handle_follow_up_created(event: FollowUpCreated) -> None:
    """
    Create a patient notification when a follow-up is created.
    """

    create_notification(
        recipient=event.patient_user,
        notification_type=Notification.NotificationType.FOLLOW_UP,
        title="New Follow-Up Plan",
        message=event.description,
        target_type="FollowUpAction",
        target_id=event.follow_up_id,
        metadata={
            "encounter_id": str(event.encounter_id),
            "doctor_id": str(event.doctor_id),
            "due_date": (
                str(event.due_date)
                if event.due_date
                else None
            ),
            "target": event.target,
        },
    )

def handle_encounter_completed(event: EncounterCompleted) -> None:
    """
    Create a patient notification when an encounter is completed.
    """

    create_notification(
        recipient=event.patient_user,
        notification_type=Notification.NotificationType.CLINICAL,
        title="Consultation Completed",
        message="Your clinical consultation has been completed.",
        target_type="ClinicalEncounter",
        target_id=event.encounter_id,
        metadata={
            "doctor_id": str(event.doctor_id),
            "appointment_id": str(event.appointment_id),
        },
    )

def handle_appointment_created(event: AppointmentCreated) -> None:
    """
    Create a patient notification when an appointment is created.
    """

    create_notification(
        recipient=event.patient_user,
        notification_type=Notification.NotificationType.APPOINTMENT,
        title="Appointment Scheduled",
        message="Your appointment has been scheduled.",
        target_type="Appointment",
        target_id=event.appointment_id,
        metadata={
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
    """
    Create a patient notification when an appointment is confirmed.
    """

    create_notification(
        recipient=event.patient_user,
        notification_type=Notification.NotificationType.APPOINTMENT,
        title="Appointment Confirmed",
        message="Your appointment has been confirmed.",
        target_type="Appointment",
        target_id=event.appointment_id,
        metadata={
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
    """
    Create a patient notification when an appointment is cancelled.
    """

    create_notification(
        recipient=event.patient_user,
        notification_type=Notification.NotificationType.APPOINTMENT,
        title="Appointment Cancelled",
        message="Your appointment has been cancelled.",
        target_type="Appointment",
        target_id=event.appointment_id,
        metadata={
            "doctor_id": str(event.doctor_id),
            "scheduled_at": (
                event.scheduled_at.isoformat()
                if event.scheduled_at
                else None
            ),
            "appointment_type": event.appointment_type,
        },
    )

def handle_appointment_reminder_due(
    event: AppointmentReminderDue,
) -> None:
    """
    Create a patient notification when an appointment reminder is due.
    """

    if event.reminder_type == "24_HOUR":
        title = "Appointment Reminder"
        message = "You have an appointment scheduled tomorrow."

    elif event.reminder_type == "1_HOUR":
        title = "Appointment Reminder"
        message = "You have an appointment scheduled in 1 hour."

    else:
        raise ValueError(
            f"Unsupported reminder type: {event.reminder_type}"
        )

    create_notification(
        recipient=event.patient_user,
        notification_type=Notification.NotificationType.APPOINTMENT,
        title=title,
        message=message,
        target_type="Appointment",
        target_id=event.appointment_id,
        metadata={
            "doctor_id": str(event.doctor_id),
            "scheduled_at": (
                event.scheduled_at.isoformat()
                if event.scheduled_at
                else None
            ),
            "appointment_type": event.appointment_type,
            "reminder_type": event.reminder_type,
        },
    )