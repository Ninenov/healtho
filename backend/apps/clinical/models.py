from django.db import models

from apps.common.models import BaseModel
from apps.patients.models import Patient


class Allergy(BaseModel):
    class Severity(models.TextChoices):
        MILD = "MILD", "Mild"
        MODERATE = "MODERATE", "Moderate"
        SEVERE = "SEVERE", "Severe"
        UNKNOWN = "UNKNOWN", "Unknown"

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="allergies",
    )

    allergen = models.CharField(
        max_length=150,
    )

    reaction = models.CharField(
        max_length=255,
        blank=True,
    )

    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.UNKNOWN,
    )

    notes = models.TextField(
        blank=True,
    )

    class Meta:
        db_table = "clinical_allergies"
        ordering = ["allergen"]

    def __str__(self):
        return f"{self.allergen} - {self.patient.healthos_uid}"

class MedicalCondition(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        RESOLVED = "RESOLVED", "Resolved"
        CHRONIC = "CHRONIC", "Chronic"
        INACTIVE = "INACTIVE", "Inactive"
        UNKNOWN = "UNKNOWN", "Unknown"

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="medical_conditions",
    )

    name = models.CharField(
        max_length=150,
    )

    diagnosed_on = models.DateField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UNKNOWN,
    )

    notes = models.TextField(
        blank=True,
    )

    class Meta:
        db_table = "clinical_medical_conditions"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} - {self.patient.healthos_uid}"