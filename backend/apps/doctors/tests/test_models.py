from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.doctors.models import Doctor


class DoctorModelTestCase(TestCase):

    def setUp(self):
        self.doctor_user = User.objects.create_user(
            phone="9876543211",
            first_name="Test",
            last_name="Doctor",
            role=UserRole.DOCTOR,
        )

        self.patient_user = User.objects.create_user(
            phone="9876543212",
            first_name="Test",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

    def test_doctor_can_be_created(self):
        doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            qualification="MBBS, MD",
            license_number="DOC-001",
        )

        self.assertIsNotNone(doctor.id)
        self.assertEqual(doctor.user, self.doctor_user)

    def test_doctor_uses_uuid(self):
        doctor = Doctor.objects.create(
            user=self.doctor_user,
        )

        self.assertIsNotNone(doctor.id)

    def test_doctor_reverse_relationship(self):
        doctor = Doctor.objects.create(
            user=self.doctor_user,
        )

        self.assertEqual(
            self.doctor_user.doctor_profile,
            doctor,
        )

    def test_doctor_profile_requires_doctor_role(self):
        doctor = Doctor(
            user=self.patient_user,
        )

        with self.assertRaises(ValidationError):
            doctor.full_clean()

    def test_doctor_profile_accepts_doctor_role(self):
        doctor = Doctor(
            user=self.doctor_user,
        )

        doctor.full_clean()

    def test_doctor_string_representation(self):
        doctor = Doctor.objects.create(
            user=self.doctor_user,
        )

        self.assertEqual(
            str(doctor),
            self.doctor_user.phone,
        )

    def test_license_number_is_unique(self):
        Doctor.objects.create(
            user=self.doctor_user,
            license_number="DOC-001",
        )

        another_user = User.objects.create_user(
            phone="9876543213",
            first_name="Another",
            last_name="Doctor",
            role=UserRole.DOCTOR,
        )

        doctor = Doctor(
            user=another_user,
            license_number="DOC-001",
        )

        with self.assertRaises(ValidationError):
            doctor.full_clean()