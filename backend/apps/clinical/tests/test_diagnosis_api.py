from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models.models import ClinicalEncounter, Diagnosis
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class DiagnosisAPITestCase(APITestCase):

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
            license_number="DOC-API-DIAGNOSIS-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-API-DIAGNOSIS-002",
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
            f"/api/v1/clinical/encounters/"
            f"{self.encounter.id}/diagnoses/"
        )

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
            scheduled_at=timezone.now() + timedelta(days=1),
            status=status,
        )

    def diagnosis_payload(self):
        return {
            "diagnosis": "Acute viral fever",
            "description": "Fever with mild body ache",
            "diagnosis_type": "PRIMARY",
            "notes": "Monitor temperature.",
        }

    def test_unauthenticated_user_cannot_access_diagnoses(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_doctor_can_create_diagnosis(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.diagnosis_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        diagnosis = Diagnosis.objects.get(
            encounter=self.encounter,
        )

        self.assertEqual(
            diagnosis.diagnosis,
            "Acute viral fever",
        )

        self.assertEqual(
            diagnosis.encounter,
            self.encounter,
        )

    def test_created_diagnosis_contains_clinical_information(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.diagnosis_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["diagnosis"],
            "Acute viral fever",
        )

        self.assertEqual(
            response.data["description"],
            "Fever with mild body ache",
        )

        self.assertEqual(
            response.data["diagnosis_type"],
            "PRIMARY",
        )

        self.assertEqual(
            response.data["notes"],
            "Monitor temperature.",
        )

    def test_doctor_can_retrieve_diagnoses(self):
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

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["diagnosis"],
            "Hypertension",
        )

    def test_patient_cannot_create_diagnosis(self):
        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.post(
            self.url,
            self.diagnosis_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertFalse(
            Diagnosis.objects.filter(
                encounter=self.encounter,
            ).exists()
        )

    def test_patient_cannot_retrieve_diagnoses(self):
        Diagnosis.objects.create(
            encounter=self.encounter,
            diagnosis="Hypertension",
            diagnosis_type=Diagnosis.DiagnosisType.PRIMARY,
        )

        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_other_doctor_cannot_create_diagnosis(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.post(
            self.url,
            self.diagnosis_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertFalse(
            Diagnosis.objects.filter(
                encounter=self.encounter,
            ).exists()
        )

    def test_other_doctor_cannot_retrieve_diagnoses(self):
        Diagnosis.objects.create(
            encounter=self.encounter,
            diagnosis="Hypertension",
            diagnosis_type=Diagnosis.DiagnosisType.PRIMARY,
        )

        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_diagnosis_requires_active_consultation(self):
        self.appointment.status = Appointment.Status.COMPLETED
        self.appointment.save(update_fields=["status"])

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.diagnosis_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Diagnosis.objects.filter(
                encounter=self.encounter,
            ).exists()
        )

    def test_diagnosis_is_attached_to_correct_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.diagnosis_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        diagnosis = Diagnosis.objects.get(
            diagnosis="Acute viral fever",
        )

        self.assertEqual(
            diagnosis.encounter.id,
            self.encounter.id,
        )

    def test_missing_diagnosis_is_rejected(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            {
                "description": "Missing diagnosis name",
                "diagnosis_type": "PRIMARY",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_multiple_diagnoses_can_be_created_for_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        first_response = self.client.post(
            self.url,
            {
                "diagnosis": "Hypertension",
                "diagnosis_type": "PRIMARY",
            },
            format="json",
        )

        second_response = self.client.post(
            self.url,
            {
                "diagnosis": "Obesity",
                "diagnosis_type": "SECONDARY",
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
            Diagnosis.objects.filter(
                encounter=self.encounter,
            ).count(),
            2,
        )
