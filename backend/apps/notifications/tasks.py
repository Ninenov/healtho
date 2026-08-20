import logging
import time

from celery import shared_task

from apps.notifications.models import NotificationDelivery
from apps.notifications.services import process_notification_delivery


logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_jitter=True,
)
def process_notification_delivery_task(
    self,
    delivery_id: int,
):
    """
    Process a notification delivery asynchronously.

    Celery owns background execution and retries.
    NotificationDeliveryService owns delivery business logic.
    """

    start_time = time.monotonic()

    logger.info(
        "Notification delivery task started",
        extra={
            "task_id": self.request.id,
            "delivery_id": delivery_id,
            "retry_count": self.request.retries,
        },
    )

    try:
        delivery = NotificationDelivery.objects.get(
            id=delivery_id,
        )

    except NotificationDelivery.DoesNotExist:
        logger.warning(
            "Notification delivery does not exist",
            extra={
                "task_id": self.request.id,
                "delivery_id": delivery_id,
                "retry_count": self.request.retries,
                "duration_ms": round(
                    (time.monotonic() - start_time) * 1000,
                    2,
                ),
            },
        )

        return {
            "delivery_id": delivery_id,
            "status": "not_found",
        }

    notification_id = delivery.notification_id

    try:
        delivery = process_notification_delivery(
            delivery=delivery,
        )

        logger.info(
            "Notification delivery task completed",
            extra={
                "task_id": self.request.id,
                "delivery_id": delivery.id,
                "notification_id": notification_id,
                "status": delivery.status,
                "attempts": delivery.attempts,
                "retry_count": self.request.retries,
                "duration_ms": round(
                    (time.monotonic() - start_time) * 1000,
                    2,
                ),
            },
        )

        return {
            "delivery_id": delivery.id,
            "status": delivery.status,
            "attempts": delivery.attempts,
        }

    except Exception as exc:
        logger.warning(
            "Notification delivery task failed; retrying",
            extra={
                "task_id": self.request.id,
                "delivery_id": delivery_id,
                "notification_id": notification_id,
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