from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models import ClinicalEncounter, FollowUpAction
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class FollowUpActionAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9777777701",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9777777702",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9777777703",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-API-FOLLOWUP-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-API-FOLLOWUP-002",
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
            examination_findings="BP 145/90",
            assessment="Possible hypertension",
            plan="Lifestyle modification",
            notes="Follow-up recommended.",
        )

        self.url = (
            f"/api/v1/clinical/encounters/"
            f"{self.encounter.id}/follow-ups/"
        )

    def payload(self):
        return {
            "action_type": "FOLLOW_UP",
            "description": "Review blood pressure after two weeks.",
            "due_date": "2026-08-30",
            "notes": "Patient should maintain BP log.",
        }

    def test_unauthenticated_user_cannot_access_follow_ups(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_doctor_can_create_follow_up(self):
        self.client.force_authenticate(user=self.doctor_user)

        response = self.client.post(
            self.url,
            self.payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        action = FollowUpAction.objects.get(
            encounter=self.encounter,
        )

        self.assertEqual(
            action.description,
            "Review blood pressure after two weeks.",
        )

    def test_doctor_can_retrieve_follow_ups(self):
        FollowUpAction.objects.create(
            encounter=self.encounter,
            action_type=FollowUpAction.ActionType.FOLLOW_UP,
            description="Review blood pressure.",
            due_date="2026-08-30",
        )

        self.client.force_authenticate(user=self.doctor_user)

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)

        self.assertEqual(
            response.data[0]["description"],
            "Review blood pressure.",
        )

    def test_patient_cannot_create_follow_up(self):
        self.client.force_authenticate(user=self.patient_user)

        response = self.client.post(
            self.url,
            self.payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_patient_cannot_retrieve_follow_ups(self):
        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_other_doctor_cannot_create_follow_up(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.post(
            self.url,
            self.payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_other_doctor_cannot_retrieve_follow_ups(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_follow_up_requires_active_consultation(self):
        self.appointment.status = Appointment.Status.COMPLETED
        self.appointment.save(update_fields=["status"])

        self.client.force_authenticate(user=self.doctor_user)

        response = self.client.post(
            self.url,
            self.payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_missing_description_is_rejected(self):
        self.client.force_authenticate(user=self.doctor_user)

        response = self.client.post(
            self.url,
            {
                "action_type": "FOLLOW_UP",
                "due_date": "2026-08-30",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_multiple_follow_ups_can_be_created(self):
        self.client.force_authenticate(user=self.doctor_user)

        first_response = self.client.post(
            self.url,
            {
                "action_type": "FOLLOW_UP",
                "description": "Review BP.",
            },
            format="json",
        )

        second_response = self.client.post(
            self.url,
            {
                "action_type": "LAB_TEST",
                "description": "Complete CBC test.",
            },
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            FollowUpAction.objects.filter(
                encounter=self.encounter,
            ).count(),
            2,
        )