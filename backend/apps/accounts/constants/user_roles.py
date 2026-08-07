from django.db import models


class UserRole(models.TextChoices):
    PATIENT = "PATIENT", "Patient"
    DOCTOR = "DOCTOR", "Doctor"
    HOSPITAL = "HOSPITAL", "Hospital"
    ADMIN = "ADMIN", "Admin"