from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.patients.models import Patient
from apps.records.models import MedicalRecord


class MedicalRecordModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone="9999999999",
            password="testpassword123",
            first_name="Test",
            last_name="Patient",
        )

        self.patient = Patient.objects.create(
            user=self.user,
            date_of_birth=date(2000, 1, 1),
        )

    def test_medical_record_creation(self):
        record = MedicalRecord.objects.create(
            patient=self.patient,
            record_type=MedicalRecord.RecordType.LAB_REPORT,
            title="Blood Test",
            description="Routine blood investigation",
            record_date=date(2026, 8, 13),
        )

        self.assertIsNotNone(record.id)
        self.assertEqual(record.patient, self.patient)
        self.assertEqual(record.record_type, MedicalRecord.RecordType.LAB_REPORT)
        self.assertEqual(record.title, "Blood Test")

    def test_healthos_uid_is_available_through_patient(self):
        record = MedicalRecord.objects.create(
            patient=self.patient,
            record_type=MedicalRecord.RecordType.DIAGNOSIS,
            title="General Diagnosis",
            record_date=date(2026, 8, 13),
        )

        self.assertTrue(record.patient.healthos_uid.startswith("HOS-"))