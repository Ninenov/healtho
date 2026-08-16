from django.core.exceptions import ValidationError
from django.db import models

from apps.appointments.models import Appointment
from apps.common.models import BaseModel
from apps.doctors.models import Doctor
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

class ClinicalEncounter(BaseModel):

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="clinical_encounter",
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="clinical_encounters",
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.PROTECT,
        related_name="clinical_encounters",
    )

    chief_complaint = models.TextField(
        blank=True,
    )

    symptoms = models.TextField(
        blank=True,
    )

    examination_findings = models.TextField(
        blank=True,
    )

    assessment = models.TextField(
        blank=True,
    )

    plan = models.TextField(
        blank=True,
    )

    notes = models.TextField(
        blank=True,
    )

    def clean(self):
        super().clean()

        if self.appointment_id:
            if self.patient_id != self.appointment.patient_id:
                raise ValidationError(
                    {
                        "patient": (
                            "Encounter patient must match "
                            "appointment patient."
                        )
                    }
                )

            if self.doctor_id != self.appointment.doctor_id:
                raise ValidationError(
                    {
                        "doctor": (
                            "Encounter doctor must match "
                            "appointment doctor."
                        )
                    }
                )

    def __str__(self):
        return (
            f"{self.patient.healthos_uid} - "
            f"{self.doctor.user.phone} - "
            f"Clinical Encounter"
        )

class Diagnosis(BaseModel):
    class DiagnosisType(models.TextChoices):
        PRIMARY = "PRIMARY", "Primary"
        SECONDARY = "SECONDARY", "Secondary"

    encounter = models.ForeignKey(
        "clinical.ClinicalEncounter",
        on_delete=models.CASCADE,
        related_name="diagnoses",
    )

    diagnosis = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    diagnosis_type = models.CharField(
        max_length=20,
        choices=DiagnosisType.choices,
        default=DiagnosisType.PRIMARY,
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.diagnosis} - {self.encounter}"

    def clean(self):
        if not self.encounter_id:
            return

        appointment = self.encounter.appointment

        if appointment.status != Appointment.Status.IN_PROGRESS:
            raise ValidationError(
                "Diagnosis can only be added during an active consultation."
            )

class Prescription(BaseModel):
    encounter = models.ForeignKey(
        "clinical.ClinicalEncounter",
        on_delete=models.CASCADE,
        related_name="prescriptions",
    )

    medication = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    route = models.CharField(max_length=100, blank=True)
    instructions = models.TextField(blank=True)

    def __str__(self):
        return f"{self.medication} - {self.encounter}"

    def clean(self):
        if not self.encounter_id:
            return

        appointment = self.encounter.appointment

        if appointment.status != appointment.Status.IN_PROGRESS:
            raise ValidationError(
                "Prescription can only be added during an active consultation."
            )

class FollowUpAction(BaseModel):
    class ActionType(models.TextChoices):
        FOLLOW_UP = "FOLLOW_UP", "Follow Up"
        LAB_TEST = "LAB_TEST", "Lab Test"
        REFERRAL = "REFERRAL", "Referral"
        PROCEDURE = "PROCEDURE", "Procedure"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    encounter = models.ForeignKey(
        "clinical.ClinicalEncounter",
        on_delete=models.CASCADE,
        related_name="follow_up_actions",
    )

    action_type = models.CharField(
        max_length=20,
        choices=ActionType.choices,
        default=ActionType.FOLLOW_UP,
    )

    description = models.TextField()

    due_date = models.DateField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.action_type} - {self.encounter}"

    def clean(self):
        if not self.encounter_id:
            return

        appointment = self.encounter.appointment

        if appointment.status != appointment.Status.IN_PROGRESS:
            raise ValidationError(
                "Follow-up action can only be added during an active consultation."
            )