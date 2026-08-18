from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.clinical.models.models import FollowUpAction
from apps.doctors.models import Doctor
from apps.notifications.models import Notification
from apps.patients.models import Patient


class NotificationServiceTestCase(APITestCase):

    def setUp(self):
        self.patient_user = User.objects.create_user(
            phone="9888888801",
            role=UserRole.PATIENT,
        )

        self.doctor_user = User.objects.create_user(
            phone="9888888802",
            role=UserRole.DOCTOR,
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
            license_number="DOC-NOTIFICATION-001",
        )

        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=Appointment.Status.IN_PROGRESS,
        )

    def test_follow_up_creates_patient_notification(self):
        from apps.clinical.models.models import ClinicalEncounter
        from apps.clinical.services.follow_up import (
            create_follow_up_action,
        )

        encounter = ClinicalEncounter.objects.create(
            appointment=self.appointment,
            patient=self.patient,
            doctor=self.doctor,
            chief_complaint="Chest discomfort",
            symptoms="Intermittent discomfort",
            assessment="Clinical assessment",
            plan="Follow-up required",
        )

        action = create_follow_up_action(
            encounter=encounter,
            doctor=self.doctor,
            action_type=FollowUpAction.ActionType.FOLLOW_UP,
            description="Return for review in two weeks.",
            due_date=timezone.now().date() + timedelta(days=14),
        )

        notification = Notification.objects.get(
            recipient=self.patient_user,
            target_type="FollowUpAction",
            target_id=str(action.id),
        )

        self.assertEqual(
            notification.notification_type,
            Notification.NotificationType.FOLLOW_UP,
        )

        self.assertEqual(
            notification.title,
            "New Follow-Up Plan",
        )

        self.assertEqual(
            notification.message,
            "Return for review in two weeks.",
        )

        self.assertEqual(
            notification.status,
            Notification.Status.UNREAD,
        )

        self.assertEqual(
            notification.metadata["encounter_id"],
            str(encounter.id),
        )

    def test_follow_up_and_notification_are_created_together(self):
        from apps.clinical.models.models import ClinicalEncounter
        from apps.clinical.services.follow_up import (
            create_follow_up_action,
        )

        encounter = ClinicalEncounter.objects.create(
            appointment=self.appointment,
            patient=self.patient,
            doctor=self.doctor,
            chief_complaint="Headache",
            symptoms="Recurring headache",
            assessment="Clinical assessment",
            plan="Follow-up",
        )

        create_follow_up_action(
            encounter=encounter,
            doctor=self.doctor,
            action_type=FollowUpAction.ActionType.FOLLOW_UP,
            description="Review symptoms after one week.",
        )

        self.assertEqual(
            FollowUpAction.objects.filter(
                encounter=encounter,
            ).count(),
            1,
        )

        self.assertEqual(
            Notification.objects.filter(
                recipient=self.patient_user,
            ).count(),
            1,
        )

    def test_notification_is_unread_by_default(self):
        from apps.clinical.models.models import ClinicalEncounter
        from apps.clinical.services.follow_up import (
            create_follow_up_action,
        )

        encounter = ClinicalEncounter.objects.create(
            appointment=self.appointment,
            patient=self.patient,
            doctor=self.doctor,
            chief_complaint="Fever",
            symptoms="Mild fever",
            assessment="Clinical assessment",
            plan="Monitor",
        )

        create_follow_up_action(
            encounter=encounter,
            doctor=self.doctor,
            action_type=FollowUpAction.ActionType.FOLLOW_UP,
            description="Follow up if symptoms continue.",
        )

        notification = Notification.objects.get(
            recipient=self.patient_user,
        )

        self.assertEqual(
            notification.status,
            Notification.Status.UNREAD,
        )

        self.assertIsNone(
            notification.read_at,
        )