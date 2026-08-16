from django.core.exceptions import ValidationError
from django.db import transaction

from apps.appointments.models import Appointment
from apps.records.models import MedicalRecord


class ClinicalRecordService:

    @staticmethod
    @transaction.atomic
    def create_from_appointment(
        *,
        appointment,
        doctor,
        record_type,
        title,
        description="",
        record_date=None,
    ):
        if appointment.doctor != doctor:
            raise ValidationError(
                {
                    "doctor": (
                        "You are not the doctor assigned to this appointment."
                    )
                }
            )

        if appointment.status != Appointment.Status.IN_PROGRESS:
            raise ValidationError(
                {
                    "appointment": (
                        "Clinical records can only be created "
                        "during an active consultation."
                    )
                }
            )

        record = MedicalRecord(
            patient=appointment.patient,
            record_type=record_type,
            title=title,
            description=description,
            record_date=record_date,
        )

        record.full_clean()
        record.save()

        return record