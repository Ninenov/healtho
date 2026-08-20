from django.test import TestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.notifications.models import (
    Notification,
    NotificationDelivery,
)
from apps.notifications.services import (
    create_notification,
    create_notification_delivery,
    process_notification_delivery,
)


class NotificationDeliveryServiceTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            phone="9999999910",
            role=UserRole.PATIENT,
        )

        self.notification = create_notification(
            recipient=self.user,
            notification_type=Notification.NotificationType.APPOINTMENT,
            title="Appointment Reminder",
            message="Your appointment is tomorrow.",
        )

    def test_delivery_is_created_as_pending(self):
        delivery = create_notification_delivery(
            notification=self.notification,
            channel=NotificationDelivery.Channel.IN_APP,
        )

        self.assertEqual(
            delivery.status,
            NotificationDelivery.Status.PENDING,
        )

        self.assertEqual(
            delivery.attempts,
            0,
        )

    def test_delivery_creation_is_idempotent(self):
        first = create_notification_delivery(
            notification=self.notification,
            channel=NotificationDelivery.Channel.IN_APP,
        )

        second = create_notification_delivery(
            notification=self.notification,
            channel=NotificationDelivery.Channel.IN_APP,
        )

        self.assertEqual(first.id, second.id)

        self.assertEqual(
            NotificationDelivery.objects.filter(
                notification=self.notification,
                channel=NotificationDelivery.Channel.IN_APP,
            ).count(),
            1,
        )

    def test_invalid_channel_is_rejected(self):
        with self.assertRaises(Exception):
            create_notification_delivery(
                notification=self.notification,
                channel="INVALID",
            )

    def test_in_app_delivery_becomes_sent(self):
        delivery = create_notification_delivery(
            notification=self.notification,
            channel=NotificationDelivery.Channel.IN_APP,
        )

        processed = process_notification_delivery(
            delivery=delivery,
        )

        self.assertEqual(
            processed.status,
            NotificationDelivery.Status.SENT,
        )

        self.assertEqual(
            processed.attempts,
            1,
        )

        self.assertIsNotNone(
            processed.sent_at,
        )

        self.assertEqual(
            processed.last_error,
            "",
        )

    def test_sent_delivery_is_idempotent(self):
        delivery = create_notification_delivery(
            notification=self.notification,
            channel=NotificationDelivery.Channel.IN_APP,
        )

        first = process_notification_delivery(
            delivery=delivery,
        )

        first_sent_at = first.sent_at

        second = process_notification_delivery(
            delivery=delivery,
        )

        self.assertEqual(
            second.id,
            first.id,
        )

        self.assertEqual(
            second.status,
            NotificationDelivery.Status.SENT,
        )

        self.assertEqual(
            second.attempts,
            1,
        )

        self.assertEqual(
            second.sent_at,
            first_sent_at,
        )

    def test_failed_delivery_records_error(self):
        delivery = create_notification_delivery(
            notification=self.notification,
            channel=NotificationDelivery.Channel.EMAIL,
        )

        with self.assertRaises(Exception):
            process_notification_delivery(
                delivery=delivery,
            )

        delivery.refresh_from_db()

        self.assertEqual(
            delivery.status,
            NotificationDelivery.Status.FAILED,
        )

        self.assertEqual(
            delivery.attempts,
            1,
        )

        self.assertTrue(
            delivery.last_error,
        )

        self.assertIsNone(
            delivery.sent_at,
        )