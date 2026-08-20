import logging
import time

import redis

from celery import shared_task
from django.conf import settings
from django.db import OperationalError

from apps.appointments.services.reminder import (
    AppointmentReminderService,
)


logger = logging.getLogger(__name__)


redis_client = redis.Redis.from_url(
    settings.CELERY_BROKER_URL,
)

REMINDER_LOCK_KEY = (
    "healthos:appointments:reminder-processing"
)

REMINDER_LOCK_TIMEOUT = 240


@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_jitter=True,
)
def process_appointment_reminders(self):
    """
    Process all currently due appointment reminders.

    Celery handles background execution and retries.
    Redis prevents overlapping executions.
    Reminder business logic remains inside
    AppointmentReminderService.
    """

    start_time = time.monotonic()

    logger.info(
        "Appointment reminder task started",
        extra={
            "task_id": self.request.id,
            "retry_count": self.request.retries,
        },
    )

    lock = redis_client.lock(
        REMINDER_LOCK_KEY,
        timeout=REMINDER_LOCK_TIMEOUT,
        blocking=False,
    )

    if not lock.acquire():
        logger.info(
            "Appointment reminder task skipped: "
            "another execution is already running",
            extra={
                "task_id": self.request.id,
                "retry_count": self.request.retries,
                "duration_ms": round(
                    (time.monotonic() - start_time) * 1000,
                    2,
                ),
            },
        )

        return {
            "processed": 0,
            "skipped": True,
            "reason": "already_running",
        }

    try:
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

        result = {
            "processed": len(processed),
            "skipped": False,
        }

        logger.info(
            "Appointment reminder task completed",
            extra={
                "task_id": self.request.id,
                "processed": len(processed),
                "retry_count": self.request.retries,
                "duration_ms": round(
                    (time.monotonic() - start_time) * 1000,
                    2,
                ),
            },
        )

        return result

    except OperationalError as exc:
        logger.warning(
            "Appointment reminder task retrying "
            "after database error",
            extra={
                "task_id": self.request.id,
                "retry_count": self.request.retries,
                "max_retries": self.max_retries,
                "duration_ms": round(
                    (time.monotonic() - start_time) * 1000,
                    2,
                ),
            },
            exc_info=True,
        )

        raise self.retry(exc=exc)

    finally:
        try:
            lock.release()

        except redis.exceptions.LockError:
            logger.warning(
                "Appointment reminder lock could not be released",
                extra={
                    "task_id": self.request.id,
                    "retry_count": self.request.retries,
                    "duration_ms": round(
                        (time.monotonic() - start_time) * 1000,
                        2,
                    ),
                },
            )