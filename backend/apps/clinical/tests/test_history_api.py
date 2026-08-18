from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models.models import (
    ClinicalEncounter,
    Diagnosis,
    FollowUpAction,
    Prescription,
)
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class ClinicalHistoryAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9555555601",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9555555602",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9555555603",
            role=UserRole.DOCTOR,
        )

        self.other_patient_user = User.objects.create_user(
            phone="9555555604",
            role=UserRole.PATIENT,
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
            license_number="DOC-API-HISTORY-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-API-HISTORY-002",
        )

        self.appointment = self.create_appointment()

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
            f"/api/v1/clinical/patients/"
            f"{self.patient.id}/history/"
        )

    def create_appointment(
        self,
        *,
        patient=None,
        doctor=None,
        status=Appointment.Status.IN_PROGRESS,
    ):
        return Appointment.objects.create(
            patient=patient or self.patient,
            doctor=doctor or self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=status,
        )

    def test_unauthenticated_user_cannot_access_history(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_doctor_can_retrieve_patient_history(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["patient_id"],
            str(self.patient.id),
        )

        self.assertEqual(
            len(response.data["history"]),
            1,
        )

    def test_history_contains_encounter_information(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        encounter_data = response.data["history"][0]["encounter"]

        self.assertEqual(
            encounter_data["id"],
            str(self.encounter.id),
        )

        self.assertEqual(
            encounter_data["chief_complaint"],
            "Chest discomfort",
        )

        self.assertEqual(
            encounter_data["symptoms"],
            "Intermittent chest pain",
        )

        self.assertEqual(
            encounter_data["assessment"],
            "Possible hypertension",
        )

    def test_history_contains_diagnoses(self):
        Diagnosis.objects.create(
            encounter=self.encounter,
            diagnosis="Hypertension",
            description="Elevated blood pressure",
            diagnosis_type=Diagnosis.DiagnosisType.PRIMARY,
            notes="Monitor BP.",
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        diagnoses = response.data["history"][0]["diagnoses"]

        self.assertEqual(
            len(diagnoses),
            1,
        )

        self.assertEqual(
            diagnoses[0]["diagnosis"],
            "Hypertension",
        )

        self.assertEqual(
            diagnoses[0]["diagnosis_type"],
            "PRIMARY",
        )

    def test_history_contains_prescriptions(self):
        Prescription.objects.create(
            encounter=self.encounter,
            medication="Amlodipine",
            dosage="5 mg",
            frequency="Once daily",
            duration="30 days",
            route="Oral",
            instructions="Take after breakfast.",
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        prescriptions = response.data["history"][0]["prescriptions"]

        self.assertEqual(
            len(prescriptions),
            1,
        )

        self.assertEqual(
            prescriptions[0]["medication"],
            "Amlodipine",
        )

        self.assertEqual(
            prescriptions[0]["dosage"],
            "5 mg",
        )

    def test_history_contains_follow_ups(self):
        FollowUpAction.objects.create(
            encounter=self.encounter,
            action_type=FollowUpAction.ActionType.FOLLOW_UP,
            description="Return for BP review",
            status=FollowUpAction.Status.PENDING,
            notes="Review blood pressure.",
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        follow_ups = response.data["history"][0]["follow_ups"]

        self.assertEqual(
            len(follow_ups),
            1,
        )

        self.assertEqual(
            follow_ups[0]["action_type"],
            "FOLLOW_UP",
        )

        self.assertEqual(
            follow_ups[0]["status"],
            "PENDING",
        )

    def test_history_contains_complete_clinical_workflow(self):
        Diagnosis.objects.create(
            encounter=self.encounter,
            diagnosis="Hypertension",
            diagnosis_type=Diagnosis.DiagnosisType.PRIMARY,
        )

        Prescription.objects.create(
            encounter=self.encounter,
            medication="Amlodipine",
            dosage="5 mg",
            frequency="Once daily",
            duration="30 days",
        )

        FollowUpAction.objects.create(
            encounter=self.encounter,
            action_type=FollowUpAction.ActionType.FOLLOW_UP,
            description="BP review",
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        history_entry = response.data["history"][0]

        self.assertEqual(
            len(history_entry["diagnoses"]),
            1,
        )

        self.assertEqual(
            len(history_entry["prescriptions"]),
            1,
        )

        self.assertEqual(
            len(history_entry["follow_ups"]),
            1,
        )

    def test_doctor_cannot_access_patient_without_clinical_access(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_patient_cannot_use_doctor_history_endpoint(self):
        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_history_is_isolated_between_patients(self):
        other_appointment = self.create_appointment(
            patient=self.other_patient,
        )

        ClinicalEncounter.objects.create(
            appointment=other_appointment,
            patient=self.other_patient,
            doctor=self.doctor,
            chief_complaint="Neurological symptoms",
            symptoms="Headache",
            assessment="Migraine",
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        history = response.data["history"]

        self.assertEqual(
            len(history),
            1,
        )

        self.assertEqual(
            history[0]["encounter"]["id"],
            str(self.encounter.id),
        )

    def test_history_returns_empty_list_for_patient_without_encounters(self):
        empty_patient_user = User.objects.create_user(
            phone="9555555605",
            role=UserRole.PATIENT,
        )

        empty_patient = Patient.objects.create(
            user=empty_patient_user,
        )

        Appointment.objects.create(
            patient=empty_patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=Appointment.Status.CONFIRMED,
        )

        url = (
            f"/api/v1/clinical/patients/"
            f"{empty_patient.id}/history/"
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["history"],
            [],
        )
