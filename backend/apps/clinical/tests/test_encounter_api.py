from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models.models import ClinicalEncounter
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class ClinicalEncounterAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9444444401",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9444444402",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9444444403",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-API-ENCOUNTER-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-API-ENCOUNTER-002",
        )

        self.appointment = self.create_appointment()

        self.url = (
            f"/api/v1/clinical/appointments/"
            f"{self.appointment.id}/encounter/"
        )

    def create_appointment(
        self,
        *,
        doctor=None,
        status=Appointment.Status.IN_PROGRESS,
    ):
        return Appointment.objects.create(
            patient=self.patient,
            doctor=doctor or self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=status,
        )

    def encounter_payload(self):
        return {
            "chief_complaint": "Chest discomfort",
            "symptoms": "Intermittent chest pain",
            "examination_findings": "BP 145/90",
            "assessment": "Possible hypertension",
            "plan": "Lifestyle modification",
            "notes": "Follow-up recommended.",
        }

    def test_unauthenticated_user_cannot_access_encounter(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_doctor_can_create_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        encounter = ClinicalEncounter.objects.get(
            appointment=self.appointment,
        )

        self.assertEqual(
            encounter.patient,
            self.patient,
        )

        self.assertEqual(
            encounter.doctor,
            self.doctor,
        )

    def test_created_encounter_contains_clinical_information(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["chief_complaint"],
            "Chest discomfort",
        )

        self.assertEqual(
            response.data["assessment"],
            "Possible hypertension",
        )

    def test_patient_cannot_create_encounter(self):
        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.post(
            self.url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_other_doctor_cannot_create_encounter(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.post(
            self.url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_scheduled_appointment_cannot_create_encounter(self):
        appointment = self.create_appointment(
            status=Appointment.Status.SCHEDULED,
        )

        url = (
            f"/api/v1/clinical/appointments/"
            f"{appointment.id}/encounter/"
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_confirmed_appointment_cannot_create_encounter(self):
        appointment = self.create_appointment(
            status=Appointment.Status.CONFIRMED,
        )

        url = (
            f"/api/v1/clinical/appointments/"
            f"{appointment.id}/encounter/"
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_completed_appointment_cannot_create_encounter(self):
        appointment = self.create_appointment(
            status=Appointment.Status.COMPLETED,
        )

        url = (
            f"/api/v1/clinical/appointments/"
            f"{appointment.id}/encounter/"
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_doctor_can_retrieve_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        create_response = self.client.post(
            self.url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            create_response.status_code,
            status.HTTP_201_CREATED,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["appointment"],
            str(self.appointment.id),
        )

    def test_doctor_without_encounter_gets_not_found(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_duplicate_encounter_cannot_be_created(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        first_response = self.client.post(
            self.url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_201_CREATED,
        )

        second_response = self.client.post(
            self.url,
            self.encounter_payload(),
            format="json",
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
