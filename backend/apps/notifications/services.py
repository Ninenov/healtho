from django.core.exceptions import ValidationError
from django.db import transaction

from apps.notifications.models import Notification


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

    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        target_type=target_type,
        target_id=str(target_id) if target_id else "",
        metadata=metadata or {},
    )