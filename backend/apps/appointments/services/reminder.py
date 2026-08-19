from datetime import timedelta

from django.utils import timezone

from apps.appointments.models import Appointment
from django.db import IntegrityError, transaction
from apps.appointments.events.status import AppointmentReminderDue
from apps.common.events.registry import event_registry


class AppointmentReminderService:
    """
    Handles appointment reminder eligibility.

    Business logic only.
    Background scheduling and notification delivery remain
    outside this service.
    """

    REMINDER_ELIGIBLE_STATUSES = (
        Appointment.Status.SCHEDULED,
        Appointment.Status.CONFIRMED,
    )

    TWENTY_FOUR_HOUR_REMINDER = "24_HOUR"
    ONE_HOUR_REMINDER = "1_HOUR"

    REMINDER_WINDOWS = {
        TWENTY_FOUR_HOUR_REMINDER: (
            timedelta(hours=23, minutes=55),
            timedelta(hours=24, minutes=5),
        ),
        ONE_HOUR_REMINDER: (
            timedelta(minutes=55),
            timedelta(hours=1, minutes=5),
        ),
    }

    @classmethod
    def upcoming_appointments(cls, *, within_hours: int):
        """
        Return reminder-eligible appointments scheduled between
        now and the specified number of hours from now.

        Kept as the general-purpose appointment lookup used by
        existing callers and tests.
        """

        if within_hours <= 0:
            raise ValueError("within_hours must be greater than zero.")

        now = timezone.now()
        cutoff = now + timedelta(hours=within_hours)

        return (
            Appointment.objects
            .filter(
                scheduled_at__gt=now,
                scheduled_at__lte=cutoff,
                status__in=cls.REMINDER_ELIGIBLE_STATUSES,
            )
            .select_related(
                "patient",
                "doctor",
            )
            .order_by("scheduled_at")
        )

    @classmethod
    def appointments_due_for_reminder(cls, *, reminder_type: str):
        """
        Return appointments currently inside the requested
        reminder window.
        """

        if reminder_type not in cls.REMINDER_WINDOWS:
            raise ValueError(
                f"Unsupported reminder type: {reminder_type}"
            )

        now = timezone.now()

        lower_delta, upper_delta = cls.REMINDER_WINDOWS[
            reminder_type
        ]

        window_start = now + lower_delta
        window_end = now + upper_delta

        return (
            Appointment.objects
            .filter(
                scheduled_at__gte=window_start,
                scheduled_at__lt=window_end,
                status__in=cls.REMINDER_ELIGIBLE_STATUSES,
            )
            .select_related(
                "patient",
                "doctor",
            )
            .order_by("scheduled_at")
        )

    @classmethod
    def appointments_for_24_hour_reminder(cls):
        """
        Return appointments currently due for a 24-hour reminder.
        """

        return cls.appointments_due_for_reminder(
            reminder_type=cls.TWENTY_FOUR_HOUR_REMINDER,
        )

    @classmethod
    def appointments_for_1_hour_reminder(cls):
        """
        Return appointments currently due for a 1-hour reminder.
        """

        return cls.appointments_due_for_reminder(
            reminder_type=cls.ONE_HOUR_REMINDER,
        )
    
    @classmethod
    def create_reminder(cls, *, appointment, reminder_type):
        """
        Create a reminder record exactly once.

        Returns:
            AppointmentReminder instance if created.
            None if the reminder already exists.
        """

        from apps.appointments.models import AppointmentReminder

        if reminder_type not in (
            AppointmentReminder.ReminderType.TWENTY_FOUR_HOUR,
            AppointmentReminder.ReminderType.ONE_HOUR,
        ):
            raise ValueError(
                f"Unsupported reminder type: {reminder_type}"
            )

        try:
            with transaction.atomic():
                reminder, created = (
                    AppointmentReminder.objects.get_or_create(
                        appointment=appointment,
                        reminder_type=reminder_type,
                    )
                )

        except IntegrityError:
            return None

        if not created:
            return None

        return reminder

    @classmethod
    def process_due_reminders(cls, *, reminder_type: str):
        """
        Find appointments currently due for a reminder, create a
        persistent reminder record, and dispatch the reminder event.

        Duplicate reminders are ignored by the persistence layer.
        """

        appointments = cls.appointments_due_for_reminder(
            reminder_type=reminder_type,
        )

        processed = []

        for appointment in appointments:
            reminder = cls.create_reminder(
                appointment=appointment,
                reminder_type=reminder_type,
            )

            if reminder is None:
                continue

            event = AppointmentReminderDue(
                appointment_id=appointment.id,
                patient_id=appointment.patient_id,
                patient_user=appointment.patient.user,
                doctor_id=appointment.doctor_id,
                scheduled_at=appointment.scheduled_at,
                appointment_type=appointment.appointment_type,
                reminder_type=(
                    reminder_type.value
                    if hasattr(reminder_type, "value")
                    else reminder_type
                ),
            )
            event_registry.dispatch(event)

            processed.append(reminder)

        return processed