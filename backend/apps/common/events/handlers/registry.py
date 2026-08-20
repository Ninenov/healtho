from apps.appointments.events.appointment import AppointmentCreated
from apps.appointments.events.status import (
    AppointmentCancelled,
    AppointmentConfirmed,
)
from apps.common.events.registry import event_registry

from .audit import (
    handle_appointment_cancelled,
    handle_appointment_confirmed,
    handle_appointment_created,
)


def register_audit_handlers() -> None:
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