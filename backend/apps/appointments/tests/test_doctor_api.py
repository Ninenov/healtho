from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class DoctorAppointmentAPITestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.patient_user = User.objects.create_user(
            phone="9666666601",
            first_name="API",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9666666602",
            first_name="Doctor",
            last_name="One",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9666666603",
            first_name="Doctor",
            last_name="Two",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            qualification="MBBS, MD",
            license_number="DOC-API-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            qualification="MBBS, MD",
            license_number="DOC-API-002",
        )

        self.url = "/api/v1/appointments/doctor/"

    def create_appointment(
        self,
        doctor,
        offset_hours=1,
        status=Appointment.Status.SCHEDULED,
    ):
        return Appointment.objects.create(
            patient=self.patient,
            doctor=doctor,
            appointment_type=(
                Appointment.AppointmentType.CONSULTATION
            ),
            scheduled_at=(
                timezone.now()
                + timedelta(hours=offset_hours)
            ),
            status=status,
        )

    def test_unauthenticated_doctor_appointments_rejected(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            401,
        )

    def test_patient_cannot_access_doctor_appointments(self):
        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_doctor_sees_own_appointments(self):
        own_appointment = self.create_appointment(
            doctor=self.doctor,
        )

        self.create_appointment(
            doctor=self.other_doctor,
            offset_hours=2,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            200,
        )

        returned_ids = {
            item["id"]
            for item in response.data
        }

        self.assertIn(
            str(own_appointment.id),
            returned_ids,
        )

    def test_doctor_cannot_see_other_doctors_appointments(self):
        own_appointment = self.create_appointment(
            doctor=self.doctor,
        )

        other_appointment = self.create_appointment(
            doctor=self.other_doctor,
            offset_hours=2,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            200,
        )

        returned_ids = {
            item["id"]
            for item in response.data
        }

        self.assertIn(
            str(own_appointment.id),
            returned_ids,
        )

        self.assertNotIn(
            str(other_appointment.id),
            returned_ids,
        )

    def test_doctor_appointments_are_ordered_by_scheduled_time(self):
        later = self.create_appointment(
            doctor=self.doctor,
            offset_hours=5,
        )

        earlier = self.create_appointment(
            doctor=self.doctor,
            offset_hours=2,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            200,
        )

        returned_ids = [
            item["id"]
            for item in response.data
        ]

        self.assertEqual(
            returned_ids,
            [
                str(later.id),
                str(earlier.id),
            ],
        )