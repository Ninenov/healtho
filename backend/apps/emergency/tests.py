from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.emergency.models import EmergencyContact
from apps.patients.models import Patient


class EmergencyContactAPITestCase(APITestCase):

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
        )

        self.url = "/api/v1/emergency/contacts/"

    def test_unauthenticated_user_cannot_access_contacts(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_patient_can_create_emergency_contact(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "name": "John Doe",
                "phone": "9876543211",
                "relationship": "PARENT",
                "is_primary": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        contact = EmergencyContact.objects.get()

        self.assertEqual(
            contact.patient,
            self.patient,
        )

    def test_patient_can_list_own_contacts(self):
        EmergencyContact.objects.create(
            patient=self.patient,
            name="John Doe",
            phone="9876543211",
            relationship="PARENT",
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_patient_can_update_own_contact(self):
        contact = EmergencyContact.objects.create(
            patient=self.patient,
            name="John Doe",
            phone="9876543211",
            relationship="PARENT",
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"{self.url}{contact.id}/",
            {"name": "Updated Contact"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        contact.refresh_from_db()

        self.assertEqual(
            contact.name,
            "Updated Contact",
        )

    def test_patient_can_delete_own_contact(self):
        contact = EmergencyContact.objects.create(
            patient=self.patient,
            name="John Doe",
            phone="9876543211",
            relationship="PARENT",
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.delete(
            f"{self.url}{contact.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

    def test_patient_cannot_access_another_patients_contact(self):
        other_user = User.objects.create_user(
            phone="9876543212",
            first_name="Other",
            last_name="Patient",
        )

        other_patient = Patient.objects.create(
            user=other_user,
            gender=Patient.Gender.FEMALE,
            blood_group=Patient.BloodGroup.A_POSITIVE,
        )

        contact = EmergencyContact.objects.create(
            patient=other_patient,
            name="Other Contact",
            phone="9876543213",
            relationship="PARENT",
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f"{self.url}{contact.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )    