from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.patients.models import Patient
from apps.records.models import MedicalRecord


class MedicalRecordAPITestCase(APITestCase):

    def setUp(self):
        self.user_a = User.objects.create_user(
            phone="9999999991",
            password="testpassword123",
            first_name="Patient",
        )

        self.user_b = User.objects.create_user(
            phone="9999999992",
            password="testpassword123",
            first_name="Other",
        )

        self.patient_a = Patient.objects.create(
            user=self.user_a,
            date_of_birth=date(2000, 1, 1),
        )

        self.patient_b = Patient.objects.create(
            user=self.user_b,
            date_of_birth=date(1999, 1, 1),
        )

        self.record_a = MedicalRecord.objects.create(
            patient=self.patient_a,
            record_type=MedicalRecord.RecordType.LAB_REPORT,
            title="Patient A Blood Test",
            description="Routine test",
            record_date=date(2026, 8, 13),
        )

        self.record_b = MedicalRecord.objects.create(
            patient=self.patient_b,
            record_type=MedicalRecord.RecordType.DIAGNOSIS,
            title="Patient B Diagnosis",
            record_date=date(2026, 8, 13),
        )

    def test_authenticated_user_can_list_own_records(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.get("/api/v1/records/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["title"],
            "Patient A Blood Test",
        )

    def test_user_cannot_see_another_patients_records(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.get("/api/v1/records/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        titles = [record["title"] for record in response.data]

        self.assertIn("Patient A Blood Test", titles)
        self.assertNotIn("Patient B Diagnosis", titles)

    def test_authenticated_user_can_create_own_record(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.post(
            "/api/v1/records/",
            {
                "record_type": "PRESCRIPTION",
                "title": "New Prescription",
                "description": "Prescription details",
                "record_date": "2026-08-13",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        record = MedicalRecord.objects.get(
            title="New Prescription"
        )

        self.assertEqual(record.patient, self.patient_a)

    def test_client_cannot_assign_record_to_another_patient(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.post(
            "/api/v1/records/",
            {
                "patient": str(self.patient_b.id),
                "record_type": "LAB_REPORT",
                "title": "Attempted Cross Patient Record",
                "record_date": "2026-08-13",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        record = MedicalRecord.objects.get(
            title="Attempted Cross Patient Record"
        )

        self.assertEqual(record.patient, self.patient_a)

    def test_user_cannot_retrieve_another_patients_record(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.get(
            f"/api/v1/records/{self.record_b.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_another_patients_record(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.patch(
            f"/api/v1/records/{self.record_b.id}/",
            {
                "title": "Unauthorized Modification",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.record_b.refresh_from_db()

        self.assertEqual(
            self.record_b.title,
            "Patient B Diagnosis",
        )

    def test_user_cannot_delete_another_patients_record(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.delete(
            f"/api/v1/records/{self.record_b.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.assertTrue(
            MedicalRecord.objects.filter(
                id=self.record_b.id
            ).exists()
        )

    def test_unauthenticated_user_cannot_access_records(self):
        response = self.client.get("/api/v1/records/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )