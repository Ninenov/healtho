from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.common.models.audit import AuditLog
from apps.common.services.audit import AuditService


class AuditServiceTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            phone="9999999930",
            role=UserRole.PATIENT,
        )

    def test_valid_audit_is_created(self):
        audit = AuditService.log(
            actor=self.user,
            action=AuditLog.Action.CREATED,
            target_type="Appointment",
            target_id=101,
            metadata={
                "doctor_id": "303",
            },
        )

        self.assertIsNotNone(audit.id)
        self.assertEqual(
            audit.actor,
            self.user,
        )
        self.assertEqual(
            audit.action,
            AuditLog.Action.CREATED,
        )
        self.assertEqual(
            audit.target_type,
            "Appointment",
        )
        self.assertEqual(
            audit.target_id,
            "101",
        )
        self.assertEqual(
            audit.metadata["doctor_id"],
            "303",
        )

    def test_invalid_action_is_rejected(self):
        with self.assertRaises(ValidationError):
            AuditService.log(
                actor=self.user,
                action="INVALID",
                target_type="Appointment",
                target_id=101,
            )

    def test_missing_target_type_is_rejected(self):
        with self.assertRaises(ValidationError):
            AuditService.log(
                actor=self.user,
                action=AuditLog.Action.CREATED,
                target_type="",
                target_id=101,
            )

    def test_missing_target_id_is_rejected(self):
        with self.assertRaises(ValidationError):
            AuditService.log(
                actor=self.user,
                action=AuditLog.Action.CREATED,
                target_type="Appointment",
                target_id=None,
            )

    def test_system_audit_can_have_no_actor(self):
        audit = AuditService.log(
            actor=None,
            action=AuditLog.Action.SYSTEM,
            target_type="ReminderTask",
            target_id="task-101",
        )

        self.assertIsNone(audit.actor)
        self.assertEqual(
            audit.target_type,
            "ReminderTask",
        )

    def test_metadata_defaults_to_empty_dict(self):
        audit = AuditService.log(
            actor=self.user,
            action=AuditLog.Action.CREATED,
            target_type="Appointment",
            target_id=101,
        )

        self.assertEqual(
            audit.metadata,
            {},
        )