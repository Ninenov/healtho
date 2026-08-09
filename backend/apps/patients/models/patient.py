from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class Patient(BaseModel):
    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        OTHER = "OTHER", "Other"

    class BloodGroup(models.TextChoices):
        A_POSITIVE = "A+", "A+"
        A_NEGATIVE = "A-", "A-"
        B_POSITIVE = "B+", "B+"
        B_NEGATIVE = "B-", "B-"
        AB_POSITIVE = "AB+", "AB+"
        AB_NEGATIVE = "AB-", "AB-"
        O_POSITIVE = "O+", "O+"
        O_NEGATIVE = "O-", "O-"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_profile",
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        blank=True,
    )

    blood_group = models.CharField(
        max_length=3,
        choices=BloodGroup.choices,
        blank=True,
    )

    height_cm = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

    weight_kg = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

    profile_photo = models.ImageField(
        upload_to="patients/profile_photos/",
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.user.phone