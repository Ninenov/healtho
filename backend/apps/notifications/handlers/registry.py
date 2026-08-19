from apps.appointments.events.appointment import AppointmentCreated
from apps.clinical.events.encounter import EncounterCompleted
from apps.clinical.events.follow_up import FollowUpCreated
from apps.common.events.registry import event_registry
from apps.appointments.events.status import AppointmentCancelled
from .clinical import (
    handle_appointment_created,
    handle_encounter_completed,
    handle_follow_up_created,
    handle_appointment_confirmed,
    handle_appointment_cancelled,
    handle_appointment_reminder_due,
)
from apps.appointments.events.status import AppointmentConfirmed
from apps.appointments.events.status import (
    AppointmentCancelled,
    AppointmentConfirmed,
    AppointmentReminderDue,
)

def register_notification_handlers() -> None:
    event_registry.register(
        FollowUpCreated,
        handle_follow_up_created,
    )

    event_registry.register(
        EncounterCompleted,
        handle_encounter_completed,
    )

    event_registry.register(
        AppointmentCreated,
        handle_appointment_created,
    )

    event_registry.register(
        AppointmentConfirmed,
        handle_appointment_confirmed,
    )

    event_registry.register(
        AppointmentCancelled,
        handle_appointment_cancelled,
    )

    event_registry.register(
        AppointmentReminderDue,
        handle_appointment_reminder_due,
    )