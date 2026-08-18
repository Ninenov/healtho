from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models.models import ClinicalEncounter
from apps.clinical.services.encounter import ClinicalEncounterService
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class ClinicalEncounterServiceTestCase(TestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9555555501",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9555555502",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9555555503",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-ENCOUNTER-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-ENCOUNTER-002",
        )

        self.scheduled_at = timezone.now() + timedelta(days=1)

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
            scheduled_at=self.scheduled_at,
            status=status,
        )

    def create_encounter(self, appointment):
        return ClinicalEncounterService.create(
            appointment=appointment,
            doctor=self.doctor,
            chief_complaint="Chest discomfort",
            symptoms="Intermittent chest pain",
            examination_findings="BP 145/90",
            assessment="Possible hypertension",
            plan="Lifestyle modification",
            notes="Follow-up recommended.",
        )

    def test_doctor_can_create_encounter_during_active_consultation(self):
        appointment = self.create_appointment()

        encounter = self.create_encounter(appointment)

        self.assertIsNotNone(encounter.id)
        self.assertEqual(encounter.appointment, appointment)
        self.assertEqual(encounter.patient, self.patient)
        self.assertEqual(encounter.doctor, self.doctor)

    def test_encounter_stores_clinical_information(self):
        appointment = self.create_appointment()

        encounter = self.create_encounter(appointment)

        self.assertEqual(
            encounter.chief_complaint,
            "Chest discomfort",
        )
        self.assertEqual(
            encounter.assessment,
            "Possible hypertension",
        )
        self.assertEqual(
            encounter.plan,
            "Lifestyle modification",
        )

    def test_scheduled_appointment_cannot_create_encounter(self):
        appointment = self.create_appointment(
            status=Appointment.Status.SCHEDULED,
        )

        with self.assertRaises(ValidationError):
            self.create_encounter(appointment)

    def test_confirmed_appointment_cannot_create_encounter(self):
        appointment = self.create_appointment(
            status=Appointment.Status.CONFIRMED,
        )

        with self.assertRaises(ValidationError):
            self.create_encounter(appointment)

    def test_completed_appointment_cannot_create_encounter(self):
        appointment = self.create_appointment(
            status=Appointment.Status.COMPLETED,
        )

        with self.assertRaises(ValidationError):
            self.create_encounter(appointment)

    def test_cancelled_appointment_cannot_create_encounter(self):
        appointment = self.create_appointment(
            status=Appointment.Status.CANCELLED,
        )

        with self.assertRaises(ValidationError):
            self.create_encounter(appointment)

    def test_wrong_doctor_cannot_create_encounter(self):
        appointment = self.create_appointment()

        with self.assertRaises(ValidationError):
            ClinicalEncounterService.create(
                appointment=appointment,
                doctor=self.other_doctor,
                chief_complaint="Unauthorized",
            )

    def test_duplicate_encounter_cannot_be_created(self):
        appointment = self.create_appointment()

        self.create_encounter(appointment)

        with self.assertRaises(ValidationError):
            self.create_encounter(appointment)

    def test_encounter_uses_appointment_patient(self):
        appointment = self.create_appointment()

        encounter = self.create_encounter(appointment)

        self.assertEqual(
            encounter.patient_id,
            appointment.patient_id,
        )

    def test_encounter_uses_appointment_doctor(self):
        appointment = self.create_appointment()

        encounter = self.create_encounter(appointment)

        self.assertEqual(
            encounter.doctor_id,
            appointment.doctor_id,
        )
