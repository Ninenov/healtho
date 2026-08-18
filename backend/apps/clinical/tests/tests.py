from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.clinical.models.models import Allergy, MedicalCondition
from apps.patients.models import Patient


class AllergyAPITestCase(APITestCase):

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

        self.url = "/api/v1/clinical/allergies/"

    def test_unauthenticated_user_cannot_access_allergies(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_patient_can_create_allergy(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "allergen": "Penicillin",
                "reaction": "Skin rash",
                "severity": "SEVERE",
                "notes": "Previous reaction",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        allergy = Allergy.objects.get()

        self.assertEqual(
            allergy.patient,
            self.patient,
        )

    def test_patient_can_have_multiple_allergies(self):
        Allergy.objects.create(
            patient=self.patient,
            allergen="Penicillin",
            reaction="Skin rash",
            severity=Allergy.Severity.SEVERE,
        )

        Allergy.objects.create(
            patient=self.patient,
            allergen="Peanuts",
            reaction="Swelling",
            severity=Allergy.Severity.SEVERE,
        )

        Allergy.objects.create(
            patient=self.patient,
            allergen="Dust",
            reaction="Sneezing",
            severity=Allergy.Severity.MILD,
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            3,
        )

    def test_patient_can_update_own_allergy(self):
        allergy = Allergy.objects.create(
            patient=self.patient,
            allergen="Penicillin",
            reaction="Skin rash",
            severity=Allergy.Severity.SEVERE,
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"{self.url}{allergy.id}/",
            {
                "reaction": "Severe skin rash",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        allergy.refresh_from_db()

        self.assertEqual(
            allergy.reaction,
            "Severe skin rash",
        )

    def test_patient_can_delete_own_allergy(self):
        allergy = Allergy.objects.create(
            patient=self.patient,
            allergen="Dust",
            severity=Allergy.Severity.MILD,
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.delete(
            f"{self.url}{allergy.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

    def test_patient_cannot_access_another_patients_allergy(self):
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

        allergy = Allergy.objects.create(
            patient=other_patient,
            allergen="Peanuts",
            reaction="Swelling",
            severity=Allergy.Severity.SEVERE,
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f"{self.url}{allergy.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

class MedicalConditionAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            phone="9876543220",
            first_name="Condition",
            last_name="Patient",
        )

        self.patient = Patient.objects.create(
            user=self.user,
            gender=Patient.Gender.MALE,
            blood_group=Patient.BloodGroup.O_POSITIVE,
        )

        self.url = "/api/v1/clinical/conditions/"

    def test_unauthenticated_user_cannot_access_conditions(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_patient_can_create_condition(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "name": "Type 2 Diabetes",
                "diagnosed_on": "2024-06-15",
                "status": "CHRONIC",
                "notes": "Currently managed with medication.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        condition = MedicalCondition.objects.get()

        self.assertEqual(
            condition.patient,
            self.patient,
        )

    def test_patient_can_have_multiple_conditions(self):
        MedicalCondition.objects.create(
            patient=self.patient,
            name="Type 2 Diabetes",
            status=MedicalCondition.Status.CHRONIC,
        )

        MedicalCondition.objects.create(
            patient=self.patient,
            name="Asthma",
            status=MedicalCondition.Status.ACTIVE,
        )

        MedicalCondition.objects.create(
            patient=self.patient,
            name="Migraine",
            status=MedicalCondition.Status.INACTIVE,
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            3,
        )

    def test_patient_can_update_own_condition(self):
        condition = MedicalCondition.objects.create(
            patient=self.patient,
            name="Asthma",
            status=MedicalCondition.Status.ACTIVE,
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"{self.url}{condition.id}/",
            {
                "status": "INACTIVE",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        condition.refresh_from_db()

        self.assertEqual(
            condition.status,
            MedicalCondition.Status.INACTIVE,
        )

    def test_patient_can_delete_own_condition(self):
        condition = MedicalCondition.objects.create(
            patient=self.patient,
            name="Migraine",
            status=MedicalCondition.Status.ACTIVE,
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.delete(
            f"{self.url}{condition.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

    def test_patient_cannot_access_another_patients_condition(self):
        other_user = User.objects.create_user(
            phone="9876543221",
            first_name="Other",
            last_name="Patient",
        )

        other_patient = Patient.objects.create(
            user=other_user,
            gender=Patient.Gender.FEMALE,
            blood_group=Patient.BloodGroup.A_POSITIVE,
        )

        condition = MedicalCondition.objects.create(
            patient=other_patient,
            name="Asthma",
            status=MedicalCondition.Status.ACTIVE,
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f"{self.url}{condition.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )
