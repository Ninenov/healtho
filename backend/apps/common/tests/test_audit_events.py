from datetime import datetime, timezone

from django.test import TestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.events.appointment import AppointmentCreated
from apps.appointments.events.status import (
    AppointmentCancelled,
    AppointmentConfirmed,
)
from apps.common.events.registry import event_registry
from apps.common.models.audit import AuditLog


class AppointmentAuditEventTests(TestCase):

    def setUp(self):
        self.patient = User.objects.create_user(
            phone="9999999950",
            role=UserRole.PATIENT,
        )

        self.scheduled_at = datetime(
            2026,
            8,
            20,
            10,
            0,
            tzinfo=timezone.utc,
        )

    def test_appointment_created_creates_audit_log(self):
        event = AppointmentCreated(
            appointment_id=101,
            patient_id=self.patient.id,
            patient_user=self.patient,
            doctor_id=303,
            scheduled_at=self.scheduled_at,
            appointment_type="CONSULTATION",
        )

        event_registry.dispatch(event)

        audit = AuditLog.objects.get(
            action=AuditLog.Action.CREATED,
            target_type="Appointment",
            target_id="101",
        )

        self.assertEqual(
            audit.actor,
            self.patient,
        )

        self.assertEqual(
            audit.metadata["patient_id"],
            str(self.patient.id),
        )

        self.assertEqual(
            audit.metadata["doctor_id"],
            "303",
        )

    def test_appointment_confirmed_creates_audit_log(self):
        event = AppointmentConfirmed(
            appointment_id=102,
            patient_id=self.patient.id,
            patient_user=self.patient,
            doctor_id=304,
            scheduled_at=self.scheduled_at,
            appointment_type="CONSULTATION",
        )

        event_registry.dispatch(event)

        audit = AuditLog.objects.get(
            action=AuditLog.Action.CONFIRMED,
            target_type="Appointment",
            target_id="102",
        )

        self.assertEqual(
            audit.actor,
            self.patient,
        )

        self.assertEqual(
            audit.metadata["doctor_id"],
            "304",
        )

    def test_appointment_cancelled_creates_audit_log(self):
        event = AppointmentCancelled(
            appointment_id=103,
            patient_id=self.patient.id,
            patient_user=self.patient,
            doctor_id=305,
            scheduled_at=self.scheduled_at,
            appointment_type="CONSULTATION",
        )

        event_registry.dispatch(event)

        audit = AuditLog.objects.get(
            action=AuditLog.Action.CANCELLED,
            target_type="Appointment",
            target_id="103",
        )

        self.assertEqual(
            audit.actor,
            self.patient,
        )

        self.assertEqual(
            audit.metadata["doctor_id"],
            "305",
        )