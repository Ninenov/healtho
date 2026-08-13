from django.db import models

from apps.common.models import BaseModel
from apps.patients.models import Patient


class MedicalRecord(BaseModel):
    class RecordType(models.TextChoices):
        DIAGNOSIS = "DIAGNOSIS", "Diagnosis"
        PRESCRIPTION = "PRESCRIPTION", "Prescription"
        LAB_REPORT = "LAB_REPORT", "Lab Report"
        IMAGING = "IMAGING", "Imaging"
        PROCEDURE = "PROCEDURE", "Procedure"
        DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY", "Discharge Summary"
        OTHER = "OTHER", "Other"

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="medical_records",
    )

    record_type = models.CharField(
        max_length=30,
        choices=RecordType.choices,
    )

    title = models.CharField(
        max_length=200,
    )

    description = models.TextField(
        blank=True,
    )

    record_date = models.DateField()

    class Meta:
        db_table = "medical_records"
        ordering = ["-record_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.patient.healthos_uid}"