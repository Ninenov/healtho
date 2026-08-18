from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models.models import (
    ClinicalAuditEvent,
    ClinicalEncounter,
)
from apps.clinical.services.audit import ClinicalAuditService
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class ClinicalAuditAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9777777701",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9777777702",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9777777703",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-AUDIT-001",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
            license_number="DOC-AUDIT-002",
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
            chief_complaint="Headache",
            symptoms="Persistent headache",
            assessment="Clinical assessment",
            plan="Observation",
        )

        self.audit_event = ClinicalAuditEvent.objects.create(
            actor=self.doctor_user,
            encounter=self.encounter,
            action=ClinicalAuditEvent.Action.ENCOUNTER_CREATED,
            target_type="ClinicalEncounter",
            target_id=str(self.encounter.id),
            metadata={
                "appointment_id": str(self.appointment.id),
            },
        )

        self.url = "/api/v1/clinical/audit/"

    def test_unauthenticated_user_cannot_access_audit(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_doctor_can_view_own_audit_events(self):
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
            response.data[0]["action"],
            ClinicalAuditEvent.Action.ENCOUNTER_CREATED,
        )

    def test_doctor_cannot_view_other_doctors_audit_events(self):
        self.client.force_authenticate(
            user=self.other_doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data,
            [],
        )

    def test_audit_can_be_filtered_by_encounter(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(
            self.url,
            {
                "encounter_id": str(self.encounter.id),
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            str(response.data[0]["encounter_id"]),
            str(self.encounter.id),
        )

    def test_audit_can_be_filtered_by_action(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(
            self.url,
            {
                "action": ClinicalAuditEvent.Action.ENCOUNTER_CREATED,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_invalid_audit_action_is_rejected(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(
            self.url,
            {
                "action": "INVALID_ACTION",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_patient_cannot_access_audit(self):
        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_audit_endpoint_is_read_only(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        post_response = self.client.post(
            self.url,
            {
                "action": ClinicalAuditEvent.Action.ENCOUNTER_CREATED,
            },
        )

        put_response = self.client.put(
            self.url,
            {
                "action": ClinicalAuditEvent.Action.ENCOUNTER_CREATED,
            },
        )

        patch_response = self.client.patch(
            self.url,
            {
                "action": ClinicalAuditEvent.Action.ENCOUNTER_CREATED,
            },
        )

        delete_response = self.client.delete(self.url)

        self.assertEqual(
            post_response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

        self.assertEqual(
            put_response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

        self.assertEqual(
            patch_response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

        self.assertEqual(
            delete_response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def test_audit_contains_actor_and_target_information(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        event = response.data[0]

        self.assertEqual(
            str(event["actor_id"]),
            str(self.doctor_user.id),
        )

        self.assertEqual(
            event["target_type"],
            "ClinicalEncounter",
        )

        self.assertEqual(
            str(event["target_id"]),
            str(self.encounter.id),
        )

        self.assertEqual(
            str(event["metadata"]["appointment_id"]),
            str(self.appointment.id),
        )