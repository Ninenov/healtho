from datetime import time, timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor, DoctorAvailability
from apps.patients.models import Patient


class AppointmentAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9000000001",
            first_name="Patient",
            last_name="One",
            role=UserRole.PATIENT,
        )

        self.other_patient_user = User.objects.create_user(
            phone="9000000002",
            first_name="Patient",
            last_name="Two",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9000000003",
            first_name="Doctor",
            last_name="One",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.other_patient = Patient.objects.create(
            user=self.other_patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            qualification="MBBS, MD",
            license_number="DOC-API-001",
        )

        self.appointment_date = self._next_weekday(0)

        DoctorAvailability.objects.create(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
            start_time=time(9, 0),
            end_time=time(17, 0),
            is_active=True,
        )

        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.make_aware(
                timezone.datetime.combine(
                    self.appointment_date,
                    time(9, 0),
                )
            ),
            reason="Routine consultation",
        )

        self.list_url = "/api/v1/appointments/"

    @staticmethod
    def _next_weekday(weekday):
        current = timezone.localdate()
        days_ahead = (weekday - current.weekday()) % 7

        if days_ahead == 0:
            days_ahead = 7

        return current + timedelta(days=days_ahead)

    def detail_url(self, appointment_id):
        return f"{self.list_url}{appointment_id}/"
    

    def test_unauthenticated_user_cannot_list_appointments(self):
        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_list_own_appointments(self):
        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            str(self.appointment.id),
        )

    def test_patient_cannot_see_another_patients_appointments(self):
        other_appointment = Appointment.objects.create(
            patient=self.other_patient,
            doctor=self.doctor,
            scheduled_at=timezone.now() + timedelta(days=2),
        )

        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get(self.list_url)

        returned_ids = [
            item["id"]
            for item in response.data
        ]

        self.assertIn(
            str(self.appointment.id),
            returned_ids,
        )

        self.assertNotIn(
            str(other_appointment.id),
            returned_ids,
        )

    def test_authenticated_user_can_create_appointment(self):
        self.client.force_authenticate(user=self.patient_user)

        scheduled_at = timezone.make_aware(
            timezone.datetime.combine(
                self.appointment_date,
                time(10, 0),
            )
        )

        
        response = self.client.post(
            self.list_url,
            {
                "doctor": str(self.doctor.id),
                "appointment_type": "FOLLOW_UP",
                "scheduled_at": scheduled_at.isoformat(),
                "reason": "Follow-up consultation",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        appointment = Appointment.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            appointment.patient,
            self.patient,
        )

        self.assertEqual(
            appointment.doctor,
            self.doctor,
        )

    def test_client_cannot_assign_appointment_to_another_patient(self):
        self.client.force_authenticate(user=self.patient_user)

        response = self.client.post(
            self.list_url,
            {
                "patient": str(self.other_patient.id),
                "doctor": str(self.doctor.id),
                "appointment_type": "CONSULTATION",
                "scheduled_at": timezone.make_aware(
                    timezone.datetime.combine(
                        self.appointment_date,
                        time(11, 0),
                    )
                ).isoformat(),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        appointment = Appointment.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            appointment.patient,
            self.patient,
        )

        self.assertNotEqual(
            appointment.patient,
            self.other_patient,
        )

    def test_patient_can_retrieve_own_appointment(self):
        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get(
            self.detail_url(self.appointment.id),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            str(self.appointment.id),
        )

    def test_patient_cannot_retrieve_another_patients_appointment(self):
        self.client.force_authenticate(user=self.other_patient_user)

        response = self.client.get(
            self.detail_url(self.appointment.id),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_patient_can_update_own_appointment(self):
        self.client.force_authenticate(user=self.patient_user)

        response = self.client.patch(
            self.detail_url(self.appointment.id),
            {
                "reason": "Updated reason",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.appointment.refresh_from_db()

        self.assertEqual(
            self.appointment.reason,
            "Updated reason",
        )

    def test_patient_cannot_update_another_patients_appointment(self):
        self.client.force_authenticate(user=self.other_patient_user)

        response = self.client.patch(
            self.detail_url(self.appointment.id),
            {
                "reason": "Malicious update",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_patient_can_cancel_own_appointment(self):
        self.client.force_authenticate(
            user=self.patient.user,
        )

        response = self.client.post(
            f"/api/v1/appointments/{self.appointment.id}/cancel/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.appointment.refresh_from_db()

        self.assertEqual(
            self.appointment.status,
            Appointment.Status.CANCELLED,
        )


    def test_patient_cannot_cancel_another_patients_appointment(self):
        self.client.force_authenticate(
            user=self.other_patient.user,
        )

        response = self.client.post(
            f"/api/v1/appointments/{self.appointment.id}/cancel/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_patient_cannot_change_appointment_status(self):
        self.client.force_authenticate(user=self.patient_user)

        response = self.client.patch(
            self.detail_url(self.appointment.id),
            {
                "status": Appointment.Status.COMPLETED,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.appointment.refresh_from_db()

        self.assertEqual(
            self.appointment.status,
            Appointment.Status.SCHEDULED,
        )