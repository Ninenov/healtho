from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from apps.records.models import MedicalRecord


class ClinicalRecordAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9555555501",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9555555502",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-RECORD-API-001",
        )

        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=Appointment.Status.IN_PROGRESS,
        )

        self.url = (
            f"/api/v1/clinical/appointments/"
            f"{self.appointment.id}/records/"
        )

    def test_doctor_can_create_record_during_consultation(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            {
                "record_type": "DIAGNOSIS",
                "title": "Hypertension",
                "description": "Blood pressure elevated.",
                "record_date": timezone.localdate().isoformat(),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            MedicalRecord.objects.filter(
                patient=self.patient,
                title="Hypertension",
            ).exists()
        )