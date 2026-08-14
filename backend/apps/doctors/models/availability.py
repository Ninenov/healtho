from django.core.exceptions import ValidationError
from django.db import models

from apps.common.models import BaseModel
from apps.doctors.models import Doctor


class DoctorAvailability(BaseModel):

    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="availabilities",
    )

    weekday = models.PositiveSmallIntegerField(
        choices=Weekday.choices,
    )

    start_time = models.TimeField()
    end_time = models.TimeField()

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["weekday", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["doctor", "weekday", "start_time"],
                name="unique_doctor_availability_start",
            ),
        ]

    def clean(self):
        super().clean()

        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError(
                    {
                        "end_time": (
                            "End time must be later than start time."
                        ),
                    }
                )

    def __str__(self):
        return (
            f"{self.doctor.user.phone} - "
            f"{self.get_weekday_display()} "
            f"{self.start_time} - {self.end_time}"
        )