from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.patients.models import Patient


class PatientProfileAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            phone="9876543210",
            first_name="Test",
            last_name="Patient",
        )

        self.patient = Patient.objects.create(
            user=self.user,
            gender=Patient.Gender.MALE,
            blood_group=Patient.BloodGroup.O_POSITIVE,
            height_cm=175,
            weight_kg=70,
        )

        self.url = "/api/v1/patients/me/"

    def test_unauthenticated_user_cannot_access_profile(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_get_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["healthos_uid"],
            self.patient.healthos_uid,
        )

    def test_authenticated_user_can_update_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            self.url,
            {
                "weight_kg": "72.50",
                "height_cm": "176.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.patient.refresh_from_db()

        self.assertEqual(
            float(self.patient.weight_kg),
            72.50,
        )

        self.assertEqual(
            float(self.patient.height_cm),
            176.00,
        )

    def test_healthos_uid_cannot_be_changed(self):
        self.client.force_authenticate(user=self.user)

        original_uid = self.patient.healthos_uid

        response = self.client.patch(
            self.url,
            {
                "healthos_uid": "HOS-MALICIOUS",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.patient.refresh_from_db()

        self.assertEqual(
            self.patient.healthos_uid,
            original_uid,
        )