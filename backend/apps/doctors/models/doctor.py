from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.accounts.constants.user_roles import UserRole
from apps.common.models import BaseModel


class Doctor(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctor_profile",
    )

    specialization = models.CharField(
        max_length=150,
        blank=True,
    )

    qualification = models.CharField(
        max_length=200,
        blank=True,
    )

    license_number = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
    )

    def clean(self):
        super().clean()

        if self.user and self.user.role != UserRole.DOCTOR:
            raise ValidationError(
                {
                    "user": "The user must have the DOCTOR role.",
                }
            )

    def __str__(self):
        return self.user.phone