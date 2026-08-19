from celery import shared_task

from apps.appointments.services.reminder import AppointmentReminderService


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def process_appointment_reminders(self):
    """
    Process all currently due appointment reminders.

    Celery handles background execution and retries.
    Reminder business logic remains inside AppointmentReminderService.
    """

    processed = []

    for reminder_type in (
        AppointmentReminderService.TWENTY_FOUR_HOUR_REMINDER,
        AppointmentReminderService.ONE_HOUR_REMINDER,
    ):
        processed.extend(
            AppointmentReminderService.process_due_reminders(
                reminder_type=reminder_type,
            )
        )

    return {
        "processed": len(processed),
    }