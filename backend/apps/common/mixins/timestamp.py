from django.db import models


class TimeStampedMixin(models.Model):
    """
    Adds created and updated timestamps.
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True