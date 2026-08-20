from django.conf import settings
from django.db import models


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        CLINICAL = "CLINICAL", "Clinical"
        APPOINTMENT = "APPOINTMENT", "Appointment"
        FOLLOW_UP = "FOLLOW_UP", "Follow Up"
        SYSTEM = "SYSTEM", "System"

    class Status(models.TextChoices):
        UNREAD = "UNREAD", "Unread"
        READ = "READ", "Read"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
    )

    title = models.CharField(
        max_length=255,
    )

    message = models.TextField()

    target_type = models.CharField(
        max_length=100,
        blank=True,
    )

    target_id = models.CharField(
        max_length=100,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UNREAD,
    )

    metadata = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    event_id = models.UUIDField(
        null=True,
        blank=True,
        db_index=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["event_id", "notification_type"],
                condition=models.Q(event_id__isnull=False),
                name="unique_event_notification_type",
            ),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient}"


class NotificationDelivery(models.Model):

    class Channel(models.TextChoices):
        IN_APP = "IN_APP", "In App"
        EMAIL = "EMAIL", "Email"
        PUSH = "PUSH", "Push"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        SENT = "SENT", "Sent"
        FAILED = "FAILED", "Failed"

    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name="deliveries",
    )

    channel = models.CharField(
        max_length=20,
        choices=Channel.choices,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    attempts = models.PositiveIntegerField(
        default=0,
    )

    last_error = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    sent_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["notification", "channel"],
                name="unique_notification_delivery_channel",
            ),
        ]

    def __str__(self):
        return (
            f"{self.notification_id} - "
            f"{self.channel} - "
            f"{self.status}"
        )
    