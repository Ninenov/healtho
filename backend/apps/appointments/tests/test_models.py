from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class AppointmentModelTestCase(TestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9876543201",
            first_name="Test",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9876543202",
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
            qualification="MBBS, MD",
            license_number="DOC-TEST-001",
        )

        self.scheduled_at = timezone.now() + timedelta(days=1)

    def create_appointment(self, **kwargs):
        defaults = {
            "patient": self.patient,
            "doctor": self.doctor,
            "appointment_type": Appointment.AppointmentType.CONSULTATION,
            "scheduled_at": self.scheduled_at,
            "status": Appointment.Status.SCHEDULED,
            "reason": "Regular consultation",
        }

        defaults.update(kwargs)

        return Appointment.objects.create(**defaults)

    def test_appointment_can_be_created(self):
        appointment = self.create_appointment()

        self.assertIsNotNone(appointment.id)
        self.assertEqual(appointment.patient, self.patient)
        self.assertEqual(appointment.doctor, self.doctor)

    def test_appointment_uses_uuid(self):
        appointment = self.create_appointment()

        self.assertIsNotNone(appointment.id)

    def test_patient_appointment_relationship(self):
        appointment = self.create_appointment()

        self.assertEqual(
            self.patient.appointments.first(),
            appointment,
        )

    def test_doctor_appointment_relationship(self):
        appointment = self.create_appointment()

        self.assertEqual(
            self.doctor.appointments.first(),
            appointment,
        )

    def test_default_appointment_type(self):
        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            scheduled_at=self.scheduled_at,
        )

        self.assertEqual(
            appointment.appointment_type,
            Appointment.AppointmentType.CONSULTATION,
        )

    def test_default_status(self):
        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            scheduled_at=self.scheduled_at,
        )

        self.assertEqual(
            appointment.status,
            Appointment.Status.SCHEDULED,
        )

    def test_patient_cannot_be_their_own_doctor(self):
        self.patient_user.role = UserRole.DOCTOR
        self.patient_user.save()

        doctor = Doctor.objects.create(
            user=self.patient_user,
            specialization="General Medicine",
        )

        appointment = Appointment(
            patient=self.patient,
            doctor=doctor,
            scheduled_at=self.scheduled_at,
        )

        with self.assertRaises(ValidationError):
            appointment.full_clean()

    def test_appointment_string_representation(self):
        appointment = self.create_appointment()

        self.assertIn(
            self.patient.healthos_uid,
            str(appointment),
        )

        self.assertIn(
            self.doctor.user.phone,
            str(appointment),
        )

    def test_doctor_is_protected(self):
        appointment = self.create_appointment()

        with self.assertRaises(Exception):
            self.doctor.delete()

        self.assertTrue(
            Appointment.objects.filter(id=appointment.id).exists()
        )

    def test_appointment_cannot_be_scheduled_in_the_past(self):
        appointment = Appointment(
            patient=self.patient,
            doctor=self.doctor,
            scheduled_at=timezone.now() - timedelta(hours=1),
        )

        with self.assertRaises(ValidationError):
            appointment.full_clean()