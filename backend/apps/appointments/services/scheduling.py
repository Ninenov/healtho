from datetime import timedelta

from django.core.exceptions import ValidationError

from apps.appointments.models import Appointment
from apps.doctors.models import DoctorAvailability


class SchedulingService:

    APPOINTMENT_DURATION_MINUTES = 30

    @staticmethod
    def is_doctor_available(*, doctor, scheduled_at):
        weekday = scheduled_at.weekday()
        appointment_time = scheduled_at.time()

        return DoctorAvailability.objects.filter(
            doctor=doctor,
            weekday=weekday,
            is_active=True,
            start_time__lte=appointment_time,
            end_time__gt=appointment_time,
        ).exists()

    @staticmethod
    def has_conflict(*, doctor, scheduled_at):
        appointment_end = (
            scheduled_at
            + timedelta(
                minutes=SchedulingService.APPOINTMENT_DURATION_MINUTES
            )
        )

        active_statuses = [
            Appointment.Status.SCHEDULED,
            Appointment.Status.CONFIRMED,
            Appointment.Status.IN_PROGRESS,
        ]

        appointments = Appointment.objects.filter(
            doctor=doctor,
            status__in=active_statuses,
        )

        for appointment in appointments:
            existing_start = appointment.scheduled_at
            existing_end = (
                existing_start
                + timedelta(
                    minutes=SchedulingService.APPOINTMENT_DURATION_MINUTES
                )
            )

            if (
                scheduled_at < existing_end
                and appointment_end > existing_start
            ):
                return True

        return False

    @staticmethod
    def validate_slot(*, doctor, scheduled_at):
        if not SchedulingService.is_doctor_available(
            doctor=doctor,
            scheduled_at=scheduled_at,
        ):
            raise ValidationError(
                {
                    "scheduled_at": (
                        "Doctor is not available at the requested time."
                    )
                }
            )

        if SchedulingService.has_conflict(
            doctor=doctor,
            scheduled_at=scheduled_at,
        ):
            raise ValidationError(
                {
                    "scheduled_at": (
                        "Doctor already has an appointment "
                        "at the requested time."
                    )
                }
            )