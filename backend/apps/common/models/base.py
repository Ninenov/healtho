from django.db import models

from apps.common.mixins import (
    UUIDMixin,
    TimeStampedMixin,
    SoftDeleteMixin,
)


class BaseModel(
    UUIDMixin,
    TimeStampedMixin,
    SoftDeleteMixin,
):
    """
    Base model inherited by all HealthOS models.
    """

    class Meta:
        abstract = True