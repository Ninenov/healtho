from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models.models import ClinicalEncounter, Prescription
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class PrescriptionAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9666666601",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9666666602",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9666666603",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-API-PRESCRIPTION-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-API-PRESCRIPTION-002",
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
            f"{self.encounter.id}/prescriptions/"
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

    def prescription_payload(self):
        return {
            "medication": "Paracetamol",
            "dosage": "500 mg",
            "frequency": "Twice daily",
            "duration": "5 days",
            "route": "ORAL",
            "instructions": "Take after food.",
        }

    def test_unauthenticated_user_cannot_access_prescriptions(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_doctor_can_create_prescription(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.prescription_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        prescription = Prescription.objects.get(
            encounter=self.encounter,
        )

        self.assertEqual(
            prescription.medication,
            "Paracetamol",
        )

        self.assertEqual(
            prescription.encounter,
            self.encounter,
        )

    def test_created_prescription_contains_clinical_information(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.prescription_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["medication"],
            "Paracetamol",
        )

        self.assertEqual(
            response.data["dosage"],
            "500 mg",
        )

        self.assertEqual(
            response.data["frequency"],
            "Twice daily",
        )

        self.assertEqual(
            response.data["duration"],
            "5 days",
        )

        self.assertEqual(
            response.data["route"],
            "ORAL",
        )

        self.assertEqual(
            response.data["instructions"],
            "Take after food.",
        )

    def test_doctor_can_retrieve_prescriptions(self):
        Prescription.objects.create(
            encounter=self.encounter,
            medication="Amoxicillin",
            dosage="500 mg",
            frequency="Three times daily",
            duration="7 days",
            route="ORAL",
            instructions="Complete the course.",
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
            response.data[0]["medication"],
            "Amoxicillin",
        )

    def test_patient_cannot_create_prescription(self):
        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.post(
            self.url,
            self.prescription_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertFalse(
            Prescription.objects.filter(
                encounter=self.encounter,
            ).exists()
        )

    def test_patient_cannot_retrieve_prescriptions(self):
        Prescription.objects.create(
            encounter=self.encounter,
            medication="Paracetamol",
            dosage="500 mg",
            frequency="Twice daily",
            duration="5 days",
        )

        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_other_doctor_cannot_create_prescription(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.post(
            self.url,
            self.prescription_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertFalse(
            Prescription.objects.filter(
                encounter=self.encounter,
            ).exists()
        )

    def test_other_doctor_cannot_retrieve_prescriptions(self):
        Prescription.objects.create(
            encounter=self.encounter,
            medication="Paracetamol",
            dosage="500 mg",
            frequency="Twice daily",
            duration="5 days",
        )

        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_prescription_requires_active_consultation(self):
        self.appointment.status = Appointment.Status.COMPLETED
        self.appointment.save(update_fields=["status"])

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.prescription_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Prescription.objects.filter(
                encounter=self.encounter,
            ).exists()
        )

    def test_prescription_is_attached_to_correct_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            self.prescription_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        prescription = Prescription.objects.get(
            medication="Paracetamol",
        )

        self.assertEqual(
            prescription.encounter.id,
            self.encounter.id,
        )

    def test_missing_required_field_is_rejected(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        payload = {
            "medication": "Paracetamol",
            "dosage": "500 mg",
            "frequency": "Twice daily",
            # duration intentionally missing
        }

        response = self.client.post(
            self.url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_multiple_prescriptions_can_be_created_for_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        first_response = self.client.post(
            self.url,
            {
                "medication": "Paracetamol",
                "dosage": "500 mg",
                "frequency": "Twice daily",
                "duration": "5 days",
            },
            format="json",
        )

        second_response = self.client.post(
            self.url,
            {
                "medication": "Amoxicillin",
                "dosage": "500 mg",
                "frequency": "Three times daily",
                "duration": "7 days",
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
            Prescription.objects.filter(
                encounter=self.encounter,
            ).count(),
            2,
        )
