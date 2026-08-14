from datetime import time

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.doctors.models import Doctor, DoctorAvailability
from apps.doctors.services.availability import (
    DoctorAvailabilityService,
)


User = get_user_model()


class DoctorAvailabilityServiceTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            phone="9999999999",
            password="testpassword",
        )

        self.doctor = Doctor.objects.create(
            user=self.user,
            specialization="Cardiology",
        )

    def test_doctor_can_create_availability(self):
        availability = DoctorAvailabilityService.create(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
            start_time=time(9, 0),
            end_time=time(17, 0),
        )

        self.assertEqual(
            availability.doctor,
            self.doctor,
        )

        self.assertEqual(
            availability.weekday,
            DoctorAvailability.Weekday.MONDAY,
        )

        self.assertTrue(
            availability.is_active,
        )

    def test_invalid_time_range_is_rejected(self):
        with self.assertRaises(ValidationError):
            DoctorAvailabilityService.create(
                doctor=self.doctor,
                weekday=DoctorAvailability.Weekday.MONDAY,
                start_time=time(17, 0),
                end_time=time(9, 0),
            )

    def test_overlapping_availability_is_rejected(self):
        DoctorAvailabilityService.create(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
            start_time=time(9, 0),
            end_time=time(13, 0),
        )

        with self.assertRaises(ValidationError):
            DoctorAvailabilityService.create(
                doctor=self.doctor,
                weekday=DoctorAvailability.Weekday.MONDAY,
                start_time=time(12, 0),
                end_time=time(17, 0),
            )

    def test_non_overlapping_availability_is_allowed(self):
        DoctorAvailabilityService.create(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
            start_time=time(9, 0),
            end_time=time(13, 0),
        )

        availability = DoctorAvailabilityService.create(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
            start_time=time(13, 0),
            end_time=time(17, 0),
        )

        self.assertIsNotNone(
            availability.pk,
        )

    def test_deactivate_availability(self):
        availability = DoctorAvailabilityService.create(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
            start_time=time(9, 0),
            end_time=time(17, 0),
        )

        DoctorAvailabilityService.deactivate(
            availability=availability,
        )

        availability.refresh_from_db()

        self.assertFalse(
            availability.is_active,
        )