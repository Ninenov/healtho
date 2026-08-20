import logging

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
            },
        )

        return {
            "delivery_id": delivery_id,
            "status": "not_found",
        }

    try:
        delivery = process_notification_delivery(
            delivery=delivery,
        )

        logger.info(
            "Notification delivery task completed",
            extra={
                "task_id": self.request.id,
                "delivery_id": delivery.id,
                "status": delivery.status,
                "attempts": delivery.attempts,
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
                "retry_count": self.request.retries,
            },
            exc_info=True,
        )

        raise self.retry(exc=exc)