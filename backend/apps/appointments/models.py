from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.common.models import BaseModel
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class Appointment(BaseModel):

    class AppointmentType(models.TextChoices):
        CONSULTATION = "CONSULTATION", "Consultation"
        FOLLOW_UP = "FOLLOW_UP", "Follow Up"
        CHECKUP = "CHECKUP", "Checkup"
        EMERGENCY = "EMERGENCY", "Emergency"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        CONFIRMED = "CONFIRMED", "Confirmed"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        NO_SHOW = "NO_SHOW", "No Show"

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="appointments",
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.PROTECT,
        related_name="appointments",
    )

    appointment_type = models.CharField(
        max_length=20,
        choices=AppointmentType.choices,
        default=AppointmentType.CONSULTATION,
    )

    scheduled_at = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )

    reason = models.TextField(
        blank=True,
    )

    notes = models.TextField(
        blank=True,
    )

    def clean(self):
        super().clean()

        if self.doctor_id and self.patient_id:
            if self.doctor.user_id == self.patient.user_id:
                raise ValidationError(
                    {
                        "doctor": (
                            "A patient cannot book an appointment "
                            "with themselves."
                        ),
                    }
                )

        if (
            self._state.adding
            and self.scheduled_at
            and self.scheduled_at <= timezone.now()
        ):
            raise ValidationError(
                {
                    "scheduled_at": (
                        "Appointment time must be in the future."
                    ),
                }
            )
        
    def __str__(self):
        return (
            f"{self.patient.healthos_uid} - "
            f"{self.doctor.user.phone} - "
            f"{self.scheduled_at}"
        )

class AppointmentReminder(BaseModel):

    class ReminderType(models.TextChoices):
        TWENTY_FOUR_HOUR = "24_HOUR", "24 Hour"
        ONE_HOUR = "1_HOUR", "1 Hour"

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name="reminders",
    )

    reminder_type = models.CharField(
        max_length=20,
        choices=ReminderType.choices,
    )

    sent_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["appointment", "reminder_type"],
                name="unique_appointment_reminder_type",
            ),
        ]

    def __str__(self):
        return (
            f"{self.appointment_id} - "
            f"{self.reminder_type}"
        )

