from django.core.exceptions import ValidationError
from django.db import transaction

from apps.doctors.models import DoctorAvailability


class DoctorAvailabilityService:

    @staticmethod
    @transaction.atomic
    def create(
        *,
        doctor,
        weekday,
        start_time,
        end_time,
        is_active=True,
    ):
        if start_time >= end_time:
            raise ValidationError(
                {
                    "end_time": (
                        "End time must be later than start time."
                    )
                }
            )

        overlapping = DoctorAvailability.objects.filter(
            doctor=doctor,
            weekday=weekday,
            is_active=True,
            start_time__lt=end_time,
            end_time__gt=start_time,
        )

        if overlapping.exists():
            raise ValidationError(
                {
                    "availability": (
                        "This availability overlaps with an "
                        "existing availability window."
                    )
                }
            )

        availability = DoctorAvailability(
            doctor=doctor,
            weekday=weekday,
            start_time=start_time,
            end_time=end_time,
            is_active=is_active,
        )

        availability.full_clean()
        availability.save()

        return availability

    @staticmethod
    @transaction.atomic
    def update(
        *,
        availability,
        weekday=None,
        start_time=None,
        end_time=None,
        is_active=None,
    ):
        if weekday is not None:
            availability.weekday = weekday

        if start_time is not None:
            availability.start_time = start_time

        if end_time is not None:
            availability.end_time = end_time

        if is_active is not None:
            availability.is_active = is_active

        if availability.start_time >= availability.end_time:
            raise ValidationError(
                {
                    "end_time": (
                        "End time must be later than start time."
                    )
                }
            )

        overlapping = (
            DoctorAvailability.objects
            .filter(
                doctor=availability.doctor,
                weekday=availability.weekday,
                is_active=True,
                start_time__lt=availability.end_time,
                end_time__gt=availability.start_time,
            )
            .exclude(pk=availability.pk)
        )

        if availability.is_active and overlapping.exists():
            raise ValidationError(
                {
                    "availability": (
                        "This availability overlaps with an "
                        "existing availability window."
                    )
                }
            )

        availability.full_clean()
        availability.save()

        return availability

    @staticmethod
    @transaction.atomic
    def deactivate(*, availability):
        availability.is_active = False
        availability.save(
            update_fields=["is_active", "updated_at"]
        )

        return availability