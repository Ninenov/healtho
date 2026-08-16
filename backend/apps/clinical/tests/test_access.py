from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.selectors.access import doctor_has_patient_access
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class ClinicalAccessSelectorTestCase(TestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9666666601",
            first_name="Clinical",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9666666602",
            first_name="Clinical",
            last_name="Doctor",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9666666603",
            first_name="Other",
            last_name="Doctor",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            qualification="MBBS, MD",
            license_number="DOC-CLINICAL-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            qualification="MBBS, MD",
            license_number="DOC-CLINICAL-002",
        )

        self.scheduled_at = timezone.now() + timedelta(days=2)

    def create_appointment(self, *, doctor, status):
        return Appointment.objects.create(
            patient=self.patient,
            doctor=doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=self.scheduled_at,
            status=status,
        )

    def test_confirmed_appointment_grants_access(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CONFIRMED,
        )

        self.assertTrue(
            doctor_has_patient_access(
                doctor=self.doctor,
                patient=self.patient,
            )
        )

    def test_in_progress_appointment_grants_access(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.IN_PROGRESS,
        )

        self.assertTrue(
            doctor_has_patient_access(
                doctor=self.doctor,
                patient=self.patient,
            )
        )

    def test_completed_appointment_grants_access(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.COMPLETED,
        )

        self.assertTrue(
            doctor_has_patient_access(
                doctor=self.doctor,
                patient=self.patient,
            )
        )

    def test_scheduled_appointment_does_not_grant_access(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.SCHEDULED,
        )

        self.assertFalse(
            doctor_has_patient_access(
                doctor=self.doctor,
                patient=self.patient,
            )
        )

    def test_cancelled_appointment_does_not_grant_access(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CANCELLED,
        )

        self.assertFalse(
            doctor_has_patient_access(
                doctor=self.doctor,
                patient=self.patient,
            )
        )

    def test_no_show_appointment_does_not_grant_access(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.NO_SHOW,
        )

        self.assertFalse(
            doctor_has_patient_access(
                doctor=self.doctor,
                patient=self.patient,
            )
        )

    def test_other_doctor_does_not_get_access(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CONFIRMED,
        )

        self.assertFalse(
            doctor_has_patient_access(
                doctor=self.other_doctor,
                patient=self.patient,
            )
        )

    def test_doctor_without_appointment_does_not_get_access(self):
        self.assertFalse(
            doctor_has_patient_access(
                doctor=self.doctor,
                patient=self.patient,
            )
        )