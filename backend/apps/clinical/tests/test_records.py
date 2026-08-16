from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.services.records import ClinicalRecordService
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from apps.records.models import MedicalRecord


class ClinicalRecordServiceTestCase(TestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9666666601",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9666666602",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-CLINICAL-001",
        )

        self.scheduled_at = timezone.now() + timedelta(days=1)

    def create_appointment(
        self,
        status=Appointment.Status.IN_PROGRESS,
    ):
        return Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=self.scheduled_at,
            status=status,
        )

    def test_doctor_can_create_record_during_active_consultation(self):
        appointment = self.create_appointment()

        record = ClinicalRecordService.create_from_appointment(
            appointment=appointment,
            doctor=self.doctor,
            record_type=MedicalRecord.RecordType.DIAGNOSIS,
            title="Hypertension",
            description="Blood pressure elevated.",
            record_date=timezone.localdate(),
        )

        self.assertEqual(
            record.patient,
            self.patient,
        )

        self.assertEqual(
            record.record_type,
            MedicalRecord.RecordType.DIAGNOSIS,
        )

    def test_scheduled_appointment_cannot_create_record(self):
        appointment = self.create_appointment(
            status=Appointment.Status.SCHEDULED,
        )

        with self.assertRaises(ValidationError):
            ClinicalRecordService.create_from_appointment(
                appointment=appointment,
                doctor=self.doctor,
                record_type=MedicalRecord.RecordType.DIAGNOSIS,
                title="Diagnosis",
                record_date=timezone.localdate(),
            )

    def test_confirmed_appointment_cannot_create_record(self):
        appointment = self.create_appointment(
            status=Appointment.Status.CONFIRMED,
        )

        with self.assertRaises(ValidationError):
            ClinicalRecordService.create_from_appointment(
                appointment=appointment,
                doctor=self.doctor,
                record_type=MedicalRecord.RecordType.DIAGNOSIS,
                title="Diagnosis",
                record_date=timezone.localdate(),
            )

    def test_completed_appointment_cannot_create_record(self):
        appointment = self.create_appointment(
            status=Appointment.Status.COMPLETED,
        )

        with self.assertRaises(ValidationError):
            ClinicalRecordService.create_from_appointment(
                appointment=appointment,
                doctor=self.doctor,
                record_type=MedicalRecord.RecordType.DIAGNOSIS,
                title="Diagnosis",
                record_date=timezone.localdate(),
            )

    def test_wrong_doctor_cannot_create_record(self):
        appointment = self.create_appointment()

        other_user = User.objects.create_user(
            phone="9666666603",
            role=UserRole.DOCTOR,
        )

        other_doctor = Doctor.objects.create(
            user=other_user,
            specialization="Neurology",
            license_number="DOC-CLINICAL-002",
        )

        with self.assertRaises(ValidationError):
            ClinicalRecordService.create_from_appointment(
                appointment=appointment,
                doctor=other_doctor,
                record_type=MedicalRecord.RecordType.DIAGNOSIS,
                title="Unauthorized Diagnosis",
                record_date=timezone.localdate(),
            )