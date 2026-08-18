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

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.recipient}"