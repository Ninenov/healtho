import uuid

from django.db import models


class UUIDMixin(models.Model):
    """
    Adds UUID primary key.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    class Meta:
        abstract = True