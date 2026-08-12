from django.core.validators import RegexValidator
from django.db import models

from apps.common.models import BaseModel
from apps.patients.models import Patient


class EmergencyContact(BaseModel):
    class Relationship(models.TextChoices):
        PARENT = "PARENT", "Parent"
        SPOUSE = "SPOUSE", "Spouse"
        SIBLING = "SIBLING", "Sibling"
        CHILD = "CHILD", "Child"
        FRIEND = "FRIEND", "Friend"
        RELATIVE = "RELATIVE", "Relative"
        OTHER = "OTHER", "Other"

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="emergency_contacts",
    )

    name = models.CharField(
        max_length=150,
    )

    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r"^\+?[0-9]{10,15}$",
                message="Enter a valid phone number.",
            )
        ],
    )

    relationship = models.CharField(
        max_length=20,
        choices=Relationship.choices,
    )

    is_primary = models.BooleanField(
        default=False,
    )

    class Meta:
        db_table = "emergency_contacts"
        ordering = ["-is_primary", "created_at"]

    def __str__(self):
        return f"{self.name} - {self.patient.healthos_uid}"