from django.db import models


class SoftDeleteMixin(models.Model):
    """
    Soft delete support.
    """

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        abstract = True