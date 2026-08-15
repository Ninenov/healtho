from datetime import time, timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.appointments.services.scheduling import SchedulingService
from apps.doctors.models import Doctor, DoctorAvailability
from apps.patients.models import Patient


class SchedulingServiceTestCase(TestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9888888801",
            first_name="Test",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9888888802",
            first_name="Test",
            last_name="Doctor",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
        )

        self.monday = self._next_weekday(0)

        DoctorAvailability.objects.create(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
            start_time=time(9, 0),
            end_time=time(17, 0),
            is_active=True,
        )

    @staticmethod
    def _next_weekday(weekday):
        current = timezone.localdate()
        days_ahead = (weekday - current.weekday()) % 7

        if days_ahead == 0:
            days_ahead = 7

        return current + timedelta(days=days_ahead)

    def test_doctor_is_available_during_working_hours(self):
        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(11, 0),
            )
        )

        self.assertTrue(
            SchedulingService.is_doctor_available(
                doctor=self.doctor,
                scheduled_at=scheduled_at,
            )
        )

    def test_doctor_is_not_available_before_working_hours(self):
        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(8, 30),
            )
        )

        self.assertFalse(
            SchedulingService.is_doctor_available(
                doctor=self.doctor,
                scheduled_at=scheduled_at,
            )
        )

    def test_doctor_is_not_available_after_working_hours(self):
        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(17, 0),
            )
        )

        self.assertFalse(
            SchedulingService.is_doctor_available(
                doctor=self.doctor,
                scheduled_at=scheduled_at,
            )
        )

    def test_inactive_availability_does_not_allow_booking(self):
        DoctorAvailability.objects.filter(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
        ).update(is_active=False)

        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(11, 0),
            )
        )

        self.assertFalse(
            SchedulingService.is_doctor_available(
                doctor=self.doctor,
                scheduled_at=scheduled_at,
            )
        )

    def test_wrong_weekday_is_not_available(self):
        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.monday + timedelta(days=1),
                time(11, 0),
            )
        )

        self.assertFalse(
            SchedulingService.is_doctor_available(
                doctor=self.doctor,
                scheduled_at=scheduled_at,
            )
        )

    def create_appointment(self, scheduled_at, status=None):
        return Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=scheduled_at,
            status=status or Appointment.Status.SCHEDULED,
        )

    def test_conflict_is_detected_for_overlapping_appointment(self):
        existing_time = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(10, 0),
            )
        )

        self.create_appointment(existing_time)

        new_time = existing_time + timedelta(minutes=15)

        self.assertTrue(
            SchedulingService.has_conflict(
                doctor=self.doctor,
                scheduled_at=new_time,
            )
        )

    def test_adjacent_appointment_is_allowed(self):
        existing_time = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(10, 0),
            )
        )

        self.create_appointment(existing_time)

        new_time = existing_time + timedelta(minutes=30)

        self.assertFalse(
            SchedulingService.has_conflict(
                doctor=self.doctor,
                scheduled_at=new_time,
            )
        )

    def test_cancelled_appointment_does_not_create_conflict(self):
        existing_time = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(10, 0),
            )
        )

        self.create_appointment(
            existing_time,
            status=Appointment.Status.CANCELLED,
        )

        self.assertFalse(
            SchedulingService.has_conflict(
                doctor=self.doctor,
                scheduled_at=existing_time,
            )
        )

    def test_completed_appointment_does_not_create_conflict(self):
        existing_time = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(10, 0),
            )
        )

        self.create_appointment(
            existing_time,
            status=Appointment.Status.COMPLETED,
        )

        self.assertFalse(
            SchedulingService.has_conflict(
                doctor=self.doctor,
                scheduled_at=existing_time,
            )
        )


    def test_validate_slot_allows_valid_slot(self):
        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(11, 0),
            )
        )

        SchedulingService.validate_slot(
            doctor=self.doctor,
            scheduled_at=scheduled_at,
        )

    def test_validate_slot_rejects_unavailable_time(self):
        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(18, 0),
            )
        )

        with self.assertRaises(ValidationError):
            SchedulingService.validate_slot(
                doctor=self.doctor,
                scheduled_at=scheduled_at,
            )

    def test_validate_slot_rejects_conflicting_appointment(self):
        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.monday,
                time(11, 0),
            )
        )

        self.create_appointment(scheduled_at)

        with self.assertRaises(ValidationError):
            SchedulingService.validate_slot(
                doctor=self.doctor,
                scheduled_at=scheduled_at,
            )