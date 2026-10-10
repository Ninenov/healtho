from django.db import models

from apps.common.models import BaseModel


class PatientAddress(BaseModel):
    patient = models.OneToOneField(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="address",
    )

    address_line_1 = models.CharField(
        max_length=255,
        blank=True,
    )

    address_line_2 = models.CharField(
        max_length=255,
        blank=True,
    )

    city = models.CharField(
        max_length=100,
        blank=True,
    )

    district = models.CharField(
        max_length=100,
        blank=True,
    )

    state = models.CharField(
        max_length=100,
        blank=True,
    )

    postal_code = models.CharField(
        max_length=10,
        blank=True,
    )

    country = models.CharField(
        max_length=100,
        default="India",
    )

    def __str__(self):
        return f"{self.patient} address"