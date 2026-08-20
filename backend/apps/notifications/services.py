from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.notifications.models import (
    Notification,
    NotificationDelivery,
)

@transaction.atomic
def create_notification(
    *,
    recipient,
    notification_type: str,
    title: str,
    message: str,
    target_type: str = "",
    target_id=None,
    metadata=None,
    event_id=None,
) -> Notification:
    if not recipient:
        raise ValidationError(
            "Notification recipient is required."
        )

    if not notification_type:
        raise ValidationError(
            "Notification type is required."
        )

    if notification_type not in Notification.NotificationType.values:
        raise ValidationError(
            "Invalid notification type."
        )

    if not title:
        raise ValidationError(
            "Notification title is required."
        )

    if not message:
        raise ValidationError(
            "Notification message is required."
        )

    if event_id:
        notification, _ = Notification.objects.get_or_create(
            event_id=event_id,
            notification_type=notification_type,
            defaults={
                "recipient": recipient,
                "title": title,
                "message": message,
                "target_type": target_type,
                "target_id": str(target_id) if target_id else "",
                "metadata": metadata or {},
            },
        )

        return notification

    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        target_type=target_type,
        target_id=str(target_id) if target_id else "",
        metadata=metadata or {},
    )

@transaction.atomic
def create_notification_delivery(
    *,
    notification,
    channel: str,
) -> NotificationDelivery:
    if not notification:
        raise ValidationError(
            "Notification is required."
        )

    if channel not in NotificationDelivery.Channel.values:
        raise ValidationError(
            "Invalid notification delivery channel."
        )

    delivery, _ = NotificationDelivery.objects.get_or_create(
        notification=notification,
        channel=channel,
    )

    return delivery

@transaction.atomic
def process_notification_delivery(
    *,
    delivery: NotificationDelivery,
) -> NotificationDelivery:
    if not delivery:
        raise ValidationError(
            "Notification delivery is required."
        )

    delivery.refresh_from_db()

    # Idempotency: an already delivered notification
    # must never be delivered again.
    if delivery.status == NotificationDelivery.Status.SENT:
        return delivery

    delivery.status = NotificationDelivery.Status.PROCESSING
    delivery.attempts += 1
    delivery.last_error = ""
    delivery.save(
        update_fields=[
            "status",
            "attempts",
            "last_error",
            "updated_at",
        ]
    )

    try:
        if delivery.channel == NotificationDelivery.Channel.IN_APP:
            # The Notification record itself represents
            # the in-app delivery.
            delivery.status = NotificationDelivery.Status.SENT
            delivery.sent_at = timezone.now()
            delivery.save(
                update_fields=[
                    "status",
                    "sent_at",
                    "updated_at",
                ]
            )

            return delivery

        raise ValidationError(
            f"Unsupported delivery channel: {delivery.channel}"
        )

    except Exception as exc:
        delivery.status = NotificationDelivery.Status.FAILED
        delivery.last_error = str(exc)
        delivery.save(
            update_fields=[
                "status",
                "last_error",
                "updated_at",
            ]
        )

        raise

