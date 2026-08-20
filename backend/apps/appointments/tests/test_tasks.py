from unittest.mock import patch

from django.test import SimpleTestCase

from apps.appointments.tasks import process_appointment_reminders


class AppointmentReminderTaskTestCase(SimpleTestCase):

    @patch(
        "apps.appointments.tasks.AppointmentReminderService"
    )
    @patch(
        "apps.appointments.tasks.redis_client"
    )
    def test_task_processes_reminders(
        self,
        mock_redis_client,
        mock_service,
    ):
        mock_lock = mock_redis_client.lock.return_value
        mock_lock.acquire.return_value = True

        mock_service.TWENTY_FOUR_HOUR_REMINDER = "24_hour"
        mock_service.ONE_HOUR_REMINDER = "1_hour"

        mock_service.process_due_reminders.side_effect = [
            ["reminder-1"],
            ["reminder-2", "reminder-3"],
        ]

        result = process_appointment_reminders.run()

        self.assertEqual(
            result,
            {
                "processed": 3,
                "skipped": False,
            },
        )

        mock_lock.acquire.assert_called_once_with()

        self.assertEqual(
            mock_service.process_due_reminders.call_count,
            2,
        )

        mock_lock.release.assert_called_once()

    @patch(
        "apps.appointments.tasks.redis_client"
    )
    def test_task_skips_when_lock_is_held(
        self,
        mock_redis_client,
    ):
        mock_lock = mock_redis_client.lock.return_value
        mock_lock.acquire.return_value = False

        result = process_appointment_reminders.run()

        self.assertEqual(
            result,
            {
                "processed": 0,
                "skipped": True,
                "reason": "already_running",
            },
        )

        mock_lock.acquire.assert_called_once_with()
        mock_lock.release.assert_not_called()