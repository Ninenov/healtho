from unittest.mock import patch

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
)
from apps.notifications.tasks import (
    process_notification_delivery_task,
)


class NotificationDeliveryTaskTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            phone="9999999920",
            role=UserRole.PATIENT,
        )

        self.notification = create_notification(
            recipient=self.user,
            notification_type=Notification.NotificationType.APPOINTMENT,
            title="Appointment Reminder",
            message="Your appointment is tomorrow.",
        )

        self.delivery = create_notification_delivery(
            notification=self.notification,
            channel=NotificationDelivery.Channel.IN_APP,
        )

    @patch(
        "apps.notifications.tasks.process_notification_delivery"
    )
    def test_task_processes_delivery(
        self,
        mock_process,
    ):
        mock_process.return_value = self.delivery

        result = process_notification_delivery_task.run(
            self.delivery.id,
        )

        mock_process.assert_called_once()

        self.assertEqual(
            result["delivery_id"],
            self.delivery.id,
        )

        self.assertEqual(
            result["status"],
            self.delivery.status,
        )

    def test_task_handles_missing_delivery(self):
        missing_id = 999999

        result = process_notification_delivery_task.run(
            missing_id,
        )

        self.assertEqual(
            result,
            {
                "delivery_id": missing_id,
                "status": "not_found",
            },
        )

    @patch(
        "apps.notifications.tasks.process_notification_delivery"
    )
    def test_task_processes_real_delivery(
        self,
        mock_process,
    ):
        mock_process.side_effect = (
            lambda *, delivery: delivery
        )

        result = process_notification_delivery_task.run(
            self.delivery.id,
        )

        self.assertEqual(
            result["delivery_id"],
            self.delivery.id,
        )

        self.assertEqual(
            result["status"],
            self.delivery.status,
        )

        self.assertEqual(
            result["attempts"],
            self.delivery.attempts,
        )