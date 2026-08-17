from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models import (
    Allergy,
    ClinicalEncounter,
    Diagnosis,
    FollowUpAction,
    MedicalCondition,
    Prescription,
)
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from apps.records.models import MedicalRecord


class ClinicalContextAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9555555701",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9555555702",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9555555703",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-API-CONTEXT-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-API-CONTEXT-002",
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
            f"/api/v1/clinical/patients/"
            f"{self.patient.id}/context/"
        )

    def test_unauthenticated_user_cannot_access_context(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_doctor_can_retrieve_patient_context(self):
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

    def test_context_contains_allergies(self):
        Allergy.objects.create(
            patient=self.patient,
            allergen="Penicillin",
            reaction="Skin rash",
            severity=Allergy.Severity.MODERATE,
            notes="Avoid penicillin.",
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        allergies = response.data["allergies"]

        self.assertEqual(
            len(allergies),
            1,
        )

        self.assertEqual(
            allergies[0]["allergen"],
            "Penicillin",
        )

    def test_context_contains_medical_conditions(self):
        MedicalCondition.objects.create(
            patient=self.patient,
            name="Hypertension",
            status=MedicalCondition.Status.ACTIVE,
            notes="Monitor BP.",
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        conditions = response.data["medical_conditions"]

        self.assertEqual(
            len(conditions),
            1,
        )

        self.assertEqual(
            conditions[0]["name"],
            "Hypertension",
        )

    def test_context_contains_medical_records(self):
        MedicalRecord.objects.create(
            patient=self.patient,
            record_type=MedicalRecord.RecordType.LAB_REPORT,
            title="Blood Test",
            description="Routine blood investigation.",
            record_date=timezone.now().date(),
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        records = response.data["medical_records"]

        self.assertEqual(
            len(records),
            1,
        )

        self.assertEqual(
            records[0]["title"],
            "Blood Test",
        )

    def test_context_contains_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        encounters = response.data["encounters"]

        self.assertEqual(
            len(encounters),
            1,
        )

        self.assertEqual(
            encounters[0]["id"],
            str(self.encounter.id),
        )

        self.assertEqual(
            encounters[0]["chief_complaint"],
            "Chest discomfort",
        )

    def test_context_contains_diagnoses(self):
        Diagnosis.objects.create(
            encounter=self.encounter,
            diagnosis="Hypertension",
            diagnosis_type=Diagnosis.DiagnosisType.PRIMARY,
            description="Elevated blood pressure",
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        diagnoses = response.data["encounters"][0]["diagnoses"]

        self.assertEqual(
            len(diagnoses),
            1,
        )

        self.assertEqual(
            diagnoses[0]["diagnosis"],
            "Hypertension",
        )

    def test_context_contains_prescriptions(self):
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

        prescriptions = response.data["encounters"][0]["prescriptions"]

        self.assertEqual(
            len(prescriptions),
            1,
        )

        self.assertEqual(
            prescriptions[0]["medication"],
            "Amlodipine",
        )

    def test_context_contains_follow_ups(self):
        FollowUpAction.objects.create(
            encounter=self.encounter,
            action_type=FollowUpAction.ActionType.FOLLOW_UP,
            description="Return for BP review",
            status=FollowUpAction.Status.PENDING,
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        follow_ups = response.data["encounters"][0]["follow_ups"]

        self.assertEqual(
            len(follow_ups),
            1,
        )

        self.assertEqual(
            follow_ups[0]["action_type"],
            "FOLLOW_UP",
        )

    def test_context_contains_complete_clinical_information(self):
        Allergy.objects.create(
            patient=self.patient,
            allergen="Penicillin",
            severity=Allergy.Severity.SEVERE,
        )

        MedicalCondition.objects.create(
            patient=self.patient,
            name="Hypertension",
            status=MedicalCondition.Status.ACTIVE,
        )

        MedicalRecord.objects.create(
            patient=self.patient,
            record_type=MedicalRecord.RecordType.LAB_REPORT,
            title="Blood Test",
            record_date=timezone.now().date(),
        )

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

        self.assertEqual(
            len(response.data["allergies"]),
            1,
        )

        self.assertEqual(
            len(response.data["medical_conditions"]),
            1,
        )

        self.assertEqual(
            len(response.data["medical_records"]),
            1,
        )

        self.assertEqual(
            len(response.data["encounters"]),
            1,
        )

        encounter = response.data["encounters"][0]

        self.assertEqual(
            len(encounter["diagnoses"]),
            1,
        )

        self.assertEqual(
            len(encounter["prescriptions"]),
            1,
        )

        self.assertEqual(
            len(encounter["follow_ups"]),
            1,
        )

    def test_other_doctor_cannot_access_patient_context(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_patient_cannot_access_doctor_context_endpoint(self):
        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_context_is_isolated_to_requested_patient(self):
        other_patient_user = User.objects.create_user(
            phone="9555555704",
            role=UserRole.PATIENT,
        )

        other_patient = Patient.objects.create(
            user=other_patient_user,
        )

        other_appointment = Appointment.objects.create(
            patient=other_patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=Appointment.Status.IN_PROGRESS,
        )

        ClinicalEncounter.objects.create(
            appointment=other_appointment,
            patient=other_patient,
            doctor=self.doctor,
            chief_complaint="Other patient complaint",
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
            len(response.data["encounters"]),
            1,
        )

        self.assertEqual(
            response.data["encounters"][0]["id"],
            str(self.encounter.id),
        )

    def test_empty_context_returns_empty_collections(self):
        patient_user = User.objects.create_user(
            phone="9555555705",
            role=UserRole.PATIENT,
        )

        patient = Patient.objects.create(
            user=patient_user,
        )

        Appointment.objects.create(
            patient=patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=Appointment.Status.CONFIRMED,
        )

        url = (
            f"/api/v1/clinical/patients/"
            f"{patient.id}/context/"
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
            response.data["allergies"],
            [],
        )

        self.assertEqual(
            response.data["medical_conditions"],
            [],
        )

        self.assertEqual(
            response.data["medical_records"],
            [],
        )

        self.assertEqual(
            response.data["encounters"],
            [],
        )