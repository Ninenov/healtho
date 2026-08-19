from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.appointments.services.reminder import AppointmentReminderService
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class AppointmentReminderServiceTestCase(TestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9888888801",
            first_name="Test",
            last_name="Patient",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9888888802",
            first_name="Test",
            last_name="Doctor",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
        )

        self.service = AppointmentReminderService()

    def create_appointment(self, scheduled_at, status=None):
        return Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=scheduled_at,
            status=status or Appointment.Status.SCHEDULED,
        )

    def test_upcoming_scheduled_appointment_is_returned(self):
        scheduled_at = timezone.now() + timedelta(hours=2)

        appointment = self.create_appointment(scheduled_at)

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertIn(appointment, appointments)

    def test_upcoming_confirmed_appointment_is_returned(self):
        scheduled_at = timezone.now() + timedelta(hours=2)

        appointment = self.create_appointment(
            scheduled_at,
            status=Appointment.Status.CONFIRMED,
        )

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertIn(appointment, appointments)

    def test_cancelled_appointment_is_excluded(self):
        scheduled_at = timezone.now() + timedelta(hours=2)

        appointment = self.create_appointment(
            scheduled_at,
            status=Appointment.Status.CANCELLED,
        )

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertNotIn(appointment, appointments)

    def test_completed_appointment_is_excluded(self):
        scheduled_at = timezone.now() + timedelta(hours=2)

        appointment = self.create_appointment(
            scheduled_at,
            status=Appointment.Status.COMPLETED,
        )

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertNotIn(appointment, appointments)

    def test_no_show_appointment_is_excluded(self):
        scheduled_at = timezone.now() + timedelta(hours=2)

        appointment = self.create_appointment(
            scheduled_at,
            status=Appointment.Status.NO_SHOW,
        )

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertNotIn(appointment, appointments)

    def test_in_progress_appointment_is_excluded(self):
        scheduled_at = timezone.now() + timedelta(hours=2)

        appointment = self.create_appointment(
            scheduled_at,
            status=Appointment.Status.IN_PROGRESS,
        )

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertNotIn(appointment, appointments)

    def test_past_appointment_is_excluded(self):
        appointment = self.create_appointment(
            timezone.now() - timedelta(hours=1),
        )

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertNotIn(appointment, appointments)

    def test_appointment_outside_window_is_excluded(self):
        appointment = self.create_appointment(
            timezone.now() + timedelta(hours=48),
        )

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertNotIn(appointment, appointments)

    def test_invalid_window_is_rejected(self):
        with self.assertRaises(ValueError):
            self.service.upcoming_appointments(
                within_hours=0,
            )

        with self.assertRaises(ValueError):
            self.service.upcoming_appointments(
                within_hours=-1,
            )

    def test_appointments_are_ordered_by_scheduled_time(self):
        later = self.create_appointment(
            timezone.now() + timedelta(hours=5),
        )

        earlier = self.create_appointment(
            timezone.now() + timedelta(hours=2),
        )

        appointments = self.service.upcoming_appointments(
            within_hours=24,
        )

        self.assertEqual(
            list(appointments),
            [earlier, later],
        )

    def test_reminder_is_created_once(self):
        from apps.appointments.models import AppointmentReminder

        appointment = self.create_appointment(
            timezone.now() + timedelta(hours=1),
        )

        first = self.service.create_reminder(
            appointment=appointment,
            reminder_type=AppointmentReminder.ReminderType.ONE_HOUR,
        )

        second = self.service.create_reminder(
            appointment=appointment,
            reminder_type=AppointmentReminder.ReminderType.ONE_HOUR,
        )

        self.assertIsNotNone(first)
        self.assertIsNone(second)

        self.assertEqual(
            AppointmentReminder.objects.filter(
                appointment=appointment,
                reminder_type=AppointmentReminder.ReminderType.ONE_HOUR,
            ).count(),
            1,
        )

    def test_different_reminder_types_can_exist_for_same_appointment(self):
        from apps.appointments.models import AppointmentReminder

        appointment = self.create_appointment(
            timezone.now() + timedelta(hours=24),
        )

        first = self.service.create_reminder(
            appointment=appointment,
            reminder_type=AppointmentReminder.ReminderType.TWENTY_FOUR_HOUR,
        )

        second = self.service.create_reminder(
            appointment=appointment,
            reminder_type=AppointmentReminder.ReminderType.ONE_HOUR,
        )

        self.assertIsNotNone(first)
        self.assertIsNotNone(second)

        self.assertEqual(
            AppointmentReminder.objects.filter(
                appointment=appointment,
            ).count(),
            2,
        )
    def test_process_due_reminders_creates_due_reminder(self):
        from apps.appointments.models import AppointmentReminder

        appointment = self.create_appointment(
            timezone.now() + timedelta(
                hours=1,
                minutes=2,
            ),
        )

        reminders = self.service.process_due_reminders(
            reminder_type=AppointmentReminder.ReminderType.ONE_HOUR,
        )

        self.assertEqual(len(reminders), 1)

        self.assertEqual(
            reminders[0].appointment,
            appointment,
        )

        self.assertEqual(
            reminders[0].reminder_type,
            AppointmentReminder.ReminderType.ONE_HOUR,
        )

    def test_process_due_reminders_dispatches_notification(self):
        from apps.appointments.events.status import (
            AppointmentReminderDue,
        )
        from apps.common.events.registry import event_registry

        appointment = self.create_appointment(
            timezone.now() + timedelta(
                hours=1,
                minutes=2,
            ),
        )

        received_events = []

        def handler(event):
            received_events.append(event)

        event_registry.register(
            AppointmentReminderDue,
            handler,
        )

        from apps.appointments.models import AppointmentReminder

        reminders = self.service.process_due_reminders(
            reminder_type=AppointmentReminder.ReminderType.ONE_HOUR,
        )

        self.assertEqual(len(reminders), 1)
        self.assertEqual(len(received_events), 1)

        event = received_events[0]

        self.assertEqual(
            event.appointment_id,
            appointment.id,
        )
        self.assertEqual(
            event.patient_id,
            appointment.patient_id,
        )
        self.assertEqual(
            event.doctor_id,
            appointment.doctor_id,
        )
        self.assertEqual(
            event.reminder_type,
            AppointmentReminder.ReminderType.ONE_HOUR.value,
        )