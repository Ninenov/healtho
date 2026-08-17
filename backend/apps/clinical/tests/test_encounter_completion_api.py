from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models import ClinicalEncounter
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class ClinicalEncounterCompletionAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9666666601",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9666666602",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9666666603",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-COMPLETE-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-COMPLETE-002",
        )

        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=Appointment.Status.IN_PROGRESS,
        )

        self.encounter = ClinicalEncounter.objects.create(
            appointment=self.appointment,
            patient=self.patient,
            doctor=self.doctor,
            chief_complaint="Chest discomfort",
            symptoms="Intermittent chest pain",
            assessment="Possible hypertension",
            plan="Lifestyle modification",
        )

        self.url = (
            f"/api/v1/clinical/encounters/"
            f"{self.encounter.id}/complete/"
        )

    def test_unauthenticated_user_cannot_complete_encounter(self):
        response = self.client.post(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_doctor_can_complete_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.appointment.refresh_from_db()

        self.assertEqual(
            self.appointment.status,
            Appointment.Status.COMPLETED,
        )

    def test_completed_encounter_is_still_retrievable(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        encounter_url = (
            f"/api/v1/clinical/appointments/"
            f"{self.appointment.id}/encounter/"
        )

        response = self.client.get(encounter_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_other_doctor_cannot_complete_encounter(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.post(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.appointment.refresh_from_db()

        self.assertEqual(
            self.appointment.status,
            Appointment.Status.IN_PROGRESS,
        )

    def test_completed_appointment_cannot_be_completed_again(self):
        self.appointment.status = Appointment.Status.COMPLETED
        self.appointment.save(update_fields=["status"])

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_scheduled_appointment_cannot_be_completed(self):
        self.appointment.status = Appointment.Status.SCHEDULED
        self.appointment.save(update_fields=["status"])

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_confirmed_appointment_cannot_be_completed(self):
        self.appointment.status = Appointment.Status.CONFIRMED
        self.appointment.save(update_fields=["status"])

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )