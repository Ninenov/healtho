from datetime import date

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.patients.models import Patient


class PatientProfileAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            phone="9999999801",
            role=UserRole.PATIENT,
        )

        self.patient = Patient.objects.create(
            user=self.user,
            date_of_birth=date(2000, 1, 15),
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

    def test_authenticated_user_can_get_own_profile(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            str(self.patient.id),
        )

        self.assertEqual(
            response.data["healthos_uid"],
            self.patient.healthos_uid,
        )

        self.assertEqual(
            response.data["gender"],
            Patient.Gender.MALE,
        )

        self.assertEqual(
            response.data["blood_group"],
            Patient.BloodGroup.O_POSITIVE,
        )

    def test_user_without_patient_profile_gets_404(self):
        user = User.objects.create_user(
            phone="9999999802",
            role=UserRole.PATIENT,
        )

        self.client.force_authenticate(
            user=user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_authenticated_user_can_update_own_profile(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.patch(
            self.url,
            {
                "height_cm": 178,
                "weight_kg": 72,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.patient.refresh_from_db()

        self.assertEqual(
            self.patient.height_cm,
            178,
        )

        self.assertEqual(
            self.patient.weight_kg,
            72,
        )

        self.assertEqual(
            response.data["height_cm"],
            "178.00",
        )

        self.assertEqual(
            response.data["weight_kg"],
            "72.00",
        )

    def test_healthos_uid_is_read_only(self):
        self.client.force_authenticate(
            user=self.user,
        )

        original_uid = self.patient.healthos_uid

        response = self.client.patch(
            self.url,
            {
                "healthos_uid": "HOS-MODIFIED",
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

    def test_invalid_height_is_rejected(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.patch(
            self.url,
            {
                "height_cm": 10,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )