from datetime import datetime, timezone

from django.test import SimpleTestCase
from apps.appointments.events.status import AppointmentReminderDue
from apps.appointments.events.appointment import AppointmentCreated


class AppointmentCreatedEventTests(SimpleTestCase):

    def test_event_contains_expected_data(self):
        scheduled_at = datetime(
            2026,
            8,
            20,
            10,
            0,
            tzinfo=timezone.utc,
        )

        event = AppointmentCreated(
            appointment_id=101,
            patient_id=202,
            patient_user=object(),
            doctor_id=303,
            scheduled_at=scheduled_at,
            appointment_type="CONSULTATION",
        )

        self.assertEqual(event.appointment_id, 101)
        self.assertEqual(event.patient_id, 202)
        self.assertEqual(event.doctor_id, 303)
        self.assertEqual(event.scheduled_at, scheduled_at)
        self.assertEqual(
            event.appointment_type,
            "CONSULTATION",
        )
        self.assertEqual(
            event.event_name,
            "AppointmentCreated",
        )
        self.assertIsNotNone(event.event_id)
        self.assertIsNotNone(event.occurred_at)

    def test_to_dict_contains_serializable_payload(self):
        scheduled_at = datetime(
            2026,
            8,
            20,
            10,
            0,
            tzinfo=timezone.utc,
        )

        event = AppointmentCreated(
            appointment_id=101,
            patient_id=202,
            patient_user=object(),
            doctor_id=303,
            scheduled_at=scheduled_at,
            appointment_type="CONSULTATION",
        )

        payload = event.to_dict()

        self.assertEqual(
            payload["event_name"],
            "AppointmentCreated",
        )
        self.assertEqual(
            payload["appointment_id"],
            101,
        )
        self.assertEqual(
            payload["patient_id"],
            202,
        )
        self.assertEqual(
            payload["doctor_id"],
            303,
        )
        self.assertEqual(
            payload["scheduled_at"],
            scheduled_at.isoformat(),
        )
        self.assertEqual(
            payload["appointment_type"],
            "CONSULTATION",
        )
        self.assertNotIn("patient_user", payload)

class AppointmentReminderDueEventTests(SimpleTestCase):

    def test_event_contains_expected_data(self):
        scheduled_at = datetime(
            2026,
            8,
            20,
            10,
            0,
            tzinfo=timezone.utc,
        )

        patient_user = object()

        event = AppointmentReminderDue(
            appointment_id=101,
            patient_id=202,
            patient_user=patient_user,
            doctor_id=303,
            scheduled_at=scheduled_at,
            appointment_type="CONSULTATION",
            reminder_type="ONE_HOUR",
        )

        self.assertEqual(event.appointment_id, 101)
        self.assertEqual(event.patient_id, 202)
        self.assertEqual(event.patient_user, patient_user)
        self.assertEqual(event.doctor_id, 303)
        self.assertEqual(event.scheduled_at, scheduled_at)
        self.assertEqual(
            event.appointment_type,
            "CONSULTATION",
        )
        self.assertEqual(
            event.reminder_type,
            "ONE_HOUR",
        )
        self.assertEqual(
            event.event_name,
            "AppointmentReminderDue",
        )
        self.assertIsNotNone(event.event_id)
        self.assertIsNotNone(event.occurred_at)

    def test_to_dict_contains_serializable_payload(self):
        scheduled_at = datetime(
            2026,
            8,
            20,
            10,
            0,
            tzinfo=timezone.utc,
        )

        event = AppointmentReminderDue(
            appointment_id=101,
            patient_id=202,
            patient_user=object(),
            doctor_id=303,
            scheduled_at=scheduled_at,
            appointment_type="CONSULTATION",
            reminder_type="24_HOUR",
        )

        payload = event.to_dict()

        self.assertEqual(
            payload["event_name"],
            "AppointmentReminderDue",
        )
        self.assertEqual(
            payload["appointment_id"],
            101,
        )
        self.assertEqual(
            payload["patient_id"],
            202,
        )
        self.assertEqual(
            payload["doctor_id"],
            303,
        )
        self.assertEqual(
            payload["scheduled_at"],
            scheduled_at.isoformat(),
        )
        self.assertEqual(
            payload["appointment_type"],
            "CONSULTATION",
        )
        self.assertEqual(
            payload["reminder_type"],
            "24_HOUR",
        )
        self.assertNotIn(
            "patient_user",
            payload,
        )