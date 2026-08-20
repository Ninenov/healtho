from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.common.models.audit import AuditLog
from apps.common.services.audit import AuditService


class AuditLogAPITestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9888888801",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9888888802",
            role=UserRole.DOCTOR,
        )

        self.hospital_user = User.objects.create_user(
            phone="9888888803",
            role=UserRole.HOSPITAL,
        )

        self.admin_user = User.objects.create_user(
            phone="9888888804",
            role=UserRole.ADMIN,
        )

        self.audit = AuditService.log(
            actor=self.doctor_user,
            action=AuditLog.Action.CREATED,
            target_type="Appointment",
            target_id="101",
            metadata={
                "doctor_id": str(self.doctor_user.id),
            },
        )

        AuditService.log(
            actor=self.hospital_user,
            action=AuditLog.Action.UPDATED,
            target_type="Patient",
            target_id="202",
            metadata={
                "source": "hospital",
            },
        )

        self.url = "/api/v1/audit/"

    def test_unauthenticated_user_cannot_access_audit(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
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

    def test_doctor_cannot_access_audit(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_hospital_can_access_audit(self):
        self.client.force_authenticate(
            user=self.hospital_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_admin_can_access_audit(self):
        self.client.force_authenticate(
            user=self.admin_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_audit_contains_expected_fields(self):
        self.client.force_authenticate(
            user=self.admin_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = response.data["results"]

        event = next(
            item
            for item in results
            if item["id"] == self.audit.id
        )

        self.assertEqual(
            str(event["actor"]),
            str(self.doctor_user.id),
        )
        self.assertEqual(
            event["action"],
            AuditLog.Action.CREATED,
        )
        self.assertEqual(
            event["target_type"],
            "Appointment",
        )
        self.assertEqual(
            event["target_id"],
            "101",
        )
        self.assertEqual(
            event["metadata"]["doctor_id"],
            str(self.doctor_user.id),
        )

    def test_audit_detail_endpoint(self):
        self.client.force_authenticate(
            user=self.admin_user,
        )

        response = self.client.get(
            f"{self.url}{self.audit.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.audit.id,
        )

    def test_audit_endpoint_is_read_only(self):
        self.client.force_authenticate(
            user=self.admin_user,
        )

        post_response = self.client.post(
            self.url,
            {
                "action": AuditLog.Action.CREATED,
                "target_type": "Appointment",
                "target_id": "999",
            },
        )

        put_response = self.client.put(
            f"{self.url}{self.audit.id}/",
            {
                "action": AuditLog.Action.UPDATED,
            },
        )

        patch_response = self.client.patch(
            f"{self.url}{self.audit.id}/",
            {
                "action": AuditLog.Action.UPDATED,
            },
        )

        delete_response = self.client.delete(
            f"{self.url}{self.audit.id}/",
        )

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

    def test_audit_can_be_filtered_by_action(self):
        self.client.force_authenticate(
            user=self.admin_user,
        )

        response = self.client.get(
            self.url,
            {
                "action": AuditLog.Action.CREATED,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = response.data["results"]

        self.assertEqual(
            len(results),
            1,
        )

        self.assertEqual(
            results[0]["action"],
            AuditLog.Action.CREATED,
        )

    def test_audit_can_be_filtered_by_target_type(self):
        self.client.force_authenticate(
            user=self.admin_user,
        )

        response = self.client.get(
            self.url,
            {
                "target_type": "Patient",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = response.data["results"]

        self.assertEqual(
            len(results),
            1,
        )

        self.assertEqual(
            results[0]["target_type"],
            "Patient",
        )

    def test_audit_can_be_filtered_by_target_id(self):
        self.client.force_authenticate(
            user=self.admin_user,
        )

        response = self.client.get(
            self.url,
            {
                "target_id": "101",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = response.data["results"]

        self.assertEqual(
            len(results),
            1,
        )

        self.assertEqual(
            results[0]["target_id"],
            "101",
        )