from django.conf import settings
from django.db import models


class AuditLog(models.Model):

    class Action(models.TextChoices):
        CREATED = "CREATED", "Created"
        UPDATED = "UPDATED", "Updated"
        DELETED = "DELETED", "Deleted"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"
        READ = "READ", "Read"
        SYSTEM = "SYSTEM", "System"

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="audit_logs",
        null=True,
        blank=True,
    )

    action = models.CharField(
        max_length=50,
        choices=Action.choices,
    )

    target_type = models.CharField(
        max_length=100,
    )

    target_id = models.CharField(
        max_length=100,
    )

    metadata = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["target_type", "target_id"],
            ),
            models.Index(
                fields=["actor", "-created_at"],
            ),
            models.Index(
                fields=["action", "-created_at"],
            ),
        ]

    def __str__(self):
        return (
            f"{self.action} - "
            f"{self.target_type}:{self.target_id}"
        )