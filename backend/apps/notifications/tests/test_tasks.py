from unittest.mock import patch
from unittest.mock import patch
from celery.exceptions import Retry
from django.test import TestCase
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

    @patch(
        "apps.notifications.tasks.process_notification_delivery"
    )
    def test_task_retries_when_delivery_processing_fails(
        self,
        mock_process,
    ):
        mock_process.side_effect = RuntimeError(
            "Delivery provider unavailable"
        )   

        with self.assertRaises(RuntimeError):
            process_notification_delivery_task.run(
                self.delivery.id,
            )

        mock_process.assert_called_once()

        self.assertEqual(
            process_notification_delivery_task.max_retries,
            3,
        )

    @patch(
        "apps.notifications.tasks.process_notification_delivery"
    )
    @patch(
        "apps.notifications.tasks.logger.warning"
    )
    def test_task_logs_failure_before_retry(
        self,
        mock_logger,
        mock_process,
    ):
        mock_process.side_effect = RuntimeError(
            "Delivery provider unavailable"
        )

        with self.assertRaises(RuntimeError):
            process_notification_delivery_task.run(
                self.delivery.id,
            )

        mock_logger.assert_called_once()

        log_message = mock_logger.call_args.args[0]

        self.assertEqual(
            log_message,
            "Notification delivery task failed; retrying",
        )

        log_extra = mock_logger.call_args.kwargs["extra"]

        self.assertEqual(
            log_extra["delivery_id"],
            self.delivery.id,
        )

        self.assertEqual(
            log_extra["notification_id"],
            self.notification.id,
        )

        self.assertEqual(
            log_extra["retry_count"],
            0,
        )

        self.assertEqual(
            log_extra["max_retries"],
            3,
        )

        self.assertIn(
            "duration_ms",
            log_extra,
        )

    def test_task_has_expected_retry_configuration(self):
        self.assertEqual(
            process_notification_delivery_task.max_retries,
            3,
        )   

        self.assertTrue(
            process_notification_delivery_task.retry_backoff,
        )

        self.assertTrue(
            process_notification_delivery_task.retry_jitter,
        )