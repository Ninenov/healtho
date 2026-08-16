from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from apps.records.models import MedicalRecord

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models import Allergy, MedicalCondition
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class DoctorPatientClinicalAPITestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.patient_user = User.objects.create_user(
            phone="9777777701",
            first_name="Clinical",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

        self.other_patient_user = User.objects.create_user(
            phone="9777777702",
            first_name="Other",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9777777703",
            first_name="Clinical",
            last_name="Doctor",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9777777704",
            first_name="Other",
            last_name="Doctor",
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
            license_number="DOC-ACCESS-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            qualification="MBBS, MD",
            license_number="DOC-ACCESS-002",
        )

        Allergy.objects.create(
            patient=self.patient,
            allergen="Penicillin",
            reaction="Rash",
            severity="MODERATE",
        )

        MedicalCondition.objects.create(
            patient=self.patient,
            name="Hypertension",
            status="ACTIVE",
        )

        self.scheduled_at = timezone.now() + timedelta(days=2)

        self.url = (
            f"/api/v1/clinical/patients/"
            f"{self.patient.id}/"
        )

    def create_appointment(
        self,
        *,
        doctor,
        patient=None,
        status=Appointment.Status.CONFIRMED,
    ):
        return Appointment.objects.create(
            patient=patient or self.patient,
            doctor=doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=self.scheduled_at,
            status=status,
        )

    def test_confirmed_doctor_can_access_patient_clinicals(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CONFIRMED,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["patient"],
            str(self.patient.id),
        )

        self.assertEqual(
            len(response.data["allergies"]),
            1,
        )

        self.assertEqual(
            len(response.data["medical_conditions"]),
            1,
        )

    def test_in_progress_doctor_can_access_patient_clinicals(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.IN_PROGRESS,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_completed_doctor_can_access_patient_clinicals(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.COMPLETED,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_doctor_without_appointment_cannot_access_patient(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_doctor_with_scheduled_appointment_cannot_access_patient(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.SCHEDULED,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_doctor_with_cancelled_appointment_cannot_access_patient(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CANCELLED,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_other_doctor_cannot_access_patient(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CONFIRMED,
        )

        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_doctor_can_access_patient_with_valid_appointment(self):
        self.create_appointment(
            doctor=self.doctor,
            patient=self.other_patient,
            status=Appointment.Status.CONFIRMED,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        other_patient_url = (
            f"/api/v1/clinical/patients/"
            f"{self.other_patient.id}/"
        )

        response = self.client.get(other_patient_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["patient"],
            str(self.other_patient.id),
        )

    def test_unknown_patient_returns_not_found(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CONFIRMED,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        unknown_patient_url = (
            "/api/v1/clinical/patients/"
            "00000000-0000-0000-0000-000000000000/"
        )

        response = self.client.get(
            unknown_patient_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_patient_cannot_use_doctor_clinical_endpoint(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CONFIRMED,
        )

        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


    def test_doctor_can_read_patient_medical_records(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CONFIRMED,
        )

        MedicalRecord.objects.create(
            patient=self.patient,
            record_type=MedicalRecord.RecordType.LAB_REPORT,
            title="Blood Test",
            description="Routine blood test",
            record_date=timezone.localdate(),
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["medical_records"]),
            1,
        )

        self.assertEqual(
            response.data["medical_records"][0]["title"],
            "Blood Test",
        )   


    def test_doctor_can_access_patient_with_no_medical_records(self):
        self.create_appointment(
            doctor=self.doctor,
            status=Appointment.Status.CONFIRMED,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["medical_records"],
            [],
        )   



    def test_doctor_without_patient_relationship_cannot_read_records(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        ) 

    def test_doctor_without_patient_relationship_cannot_read_records(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )   