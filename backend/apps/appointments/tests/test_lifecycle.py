from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.appointments.services.appointment import AppointmentService
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class AppointmentLifecycleServiceTestCase(TestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9777777701",
            first_name="Lifecycle",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9777777702",
            first_name="Lifecycle",
            last_name="Doctor",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            qualification="MBBS, MD",
            license_number="DOC-LIFE-001",
        )

        self.scheduled_at = timezone.now() + timedelta(days=2)

    def create_appointment(self, status=Appointment.Status.SCHEDULED):
        return Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=self.scheduled_at,
            status=status,
        )

    def test_scheduled_can_be_confirmed(self):
        appointment = self.create_appointment()

        AppointmentService.confirm(
            appointment=appointment,
        )

        appointment.refresh_from_db()

        self.assertEqual(
            appointment.status,
            Appointment.Status.CONFIRMED,
        )

    def test_confirmed_can_be_started(self):
        appointment = self.create_appointment(
            status=Appointment.Status.CONFIRMED,
        )

        AppointmentService.start(
            appointment=appointment,
        )

        appointment.refresh_from_db()

        self.assertEqual(
            appointment.status,
            Appointment.Status.IN_PROGRESS,
        )

    def test_in_progress_can_be_completed(self):
        appointment = self.create_appointment(
            status=Appointment.Status.IN_PROGRESS,
        )

        AppointmentService.complete(
            appointment=appointment,
        )

        appointment.refresh_from_db()

        self.assertEqual(
            appointment.status,
            Appointment.Status.COMPLETED,
        )

    def test_scheduled_can_be_cancelled(self):
        appointment = self.create_appointment()

        AppointmentService.cancel(
            appointment=appointment,
        )

        appointment.refresh_from_db()

        self.assertEqual(
            appointment.status,
            Appointment.Status.CANCELLED,
        )

    def test_confirmed_can_be_cancelled(self):
        appointment = self.create_appointment(
            status=Appointment.Status.CONFIRMED,
        )

        AppointmentService.cancel(
            appointment=appointment,
        )

        appointment.refresh_from_db()

        self.assertEqual(
            appointment.status,
            Appointment.Status.CANCELLED,
        )

    def test_confirmed_can_be_marked_no_show(self):
        appointment = self.create_appointment(
            status=Appointment.Status.CONFIRMED,
        )

        AppointmentService.no_show(
            appointment=appointment,
        )

        appointment.refresh_from_db()

        self.assertEqual(
            appointment.status,
            Appointment.Status.NO_SHOW,
        )

    def test_scheduled_cannot_be_completed(self):
        appointment = self.create_appointment()

        with self.assertRaises(ValidationError):
            AppointmentService.complete(
                appointment=appointment,
            )

    def test_scheduled_cannot_be_started(self):
        appointment = self.create_appointment()

        with self.assertRaises(ValidationError):
            AppointmentService.start(
                appointment=appointment,
            )

    def test_completed_cannot_be_changed(self):
        appointment = self.create_appointment(
            status=Appointment.Status.COMPLETED,
        )

        with self.assertRaises(ValidationError):
            AppointmentService.confirm(
                appointment=appointment,
            )

    def test_cancelled_cannot_be_changed(self):
        appointment = self.create_appointment(
            status=Appointment.Status.CANCELLED,
        )

        with self.assertRaises(ValidationError):
            AppointmentService.confirm(
                appointment=appointment,
            )

    def test_no_show_cannot_be_completed(self):
        appointment = self.create_appointment(
            status=Appointment.Status.NO_SHOW,
        )

        with self.assertRaises(ValidationError):
            AppointmentService.complete(
                appointment=appointment,
            )