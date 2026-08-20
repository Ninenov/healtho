from django.test import TestCase
from rest_framework.test import APIRequestFactory

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.common.api.permissions import CanViewAuditLogs


class AuditPermissionTestCase(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()
        self.permission = CanViewAuditLogs()

    def test_patient_cannot_view_audit_logs(self):
        user = User.objects.create_user(
            phone="9888888811",
            role=UserRole.PATIENT,
        )

        request = self.factory.get("/api/v1/audit/")
        request.user = user

        self.assertFalse(
            self.permission.has_permission(request, None)
        )

    def test_doctor_cannot_view_audit_logs(self):
        user = User.objects.create_user(
            phone="9888888812",
            role=UserRole.DOCTOR,
        )

        request = self.factory.get("/api/v1/audit/")
        request.user = user

        self.assertFalse(
            self.permission.has_permission(request, None)
        )

    def test_hospital_can_view_audit_logs(self):
        user = User.objects.create_user(
            phone="9888888813",
            role=UserRole.HOSPITAL,
        )

        request = self.factory.get("/api/v1/audit/")
        request.user = user

        self.assertTrue(
            self.permission.has_permission(request, None)
        )

    def test_admin_can_view_audit_logs(self):
        user = User.objects.create_user(
            phone="9888888814",
            role=UserRole.ADMIN,
        )

        request = self.factory.get("/api/v1/audit/")
        request.user = user

        self.assertTrue(
            self.permission.has_permission(request, None)
        )

    def test_superuser_can_view_audit_logs(self):
        user = User.objects.create_user(
            phone="9888888815",
            role=UserRole.PATIENT,
            is_superuser=True,
        )

        request = self.factory.get("/api/v1/audit/")
        request.user = user

        self.assertTrue(
            self.permission.has_permission(request, None)
        )