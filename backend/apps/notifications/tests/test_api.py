from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.notifications.models import Notification


class NotificationAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            phone="9999999901",
            role=UserRole.PATIENT,
        )

        self.other_user = User.objects.create_user(
            phone="9999999902",
            role=UserRole.PATIENT,
        )

        self.notification = Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.NotificationType.FOLLOW_UP,
            title="New Follow-Up Plan",
            message="Return for review in two weeks.",
            target_type="FollowUpAction",
            target_id="123",
            metadata={
                "encounter_id": "456",
            },
        )

        self.other_notification = Notification.objects.create(
            recipient=self.other_user,
            notification_type=Notification.NotificationType.CLINICAL,
            title="Clinical Update",
            message="Your clinical record was updated.",
        )

        self.url = "/api/v1/notifications/"

    def test_unauthenticated_user_cannot_list_notifications(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_user_can_list_own_notifications(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            self.notification.id,
        )

    def test_user_cannot_see_other_users_notifications(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        notification_ids = [
            item["id"]
            for item in response.data
        ]

        self.assertIn(
            self.notification.id,
            notification_ids,
        )

        self.assertNotIn(
            self.other_notification.id,
            notification_ids,
        )

    def test_notification_contains_expected_data(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        notification = response.data[0]

        self.assertEqual(
            notification["notification_type"],
            Notification.NotificationType.FOLLOW_UP,
        )

        self.assertEqual(
            notification["title"],
            "New Follow-Up Plan",
        )

        self.assertEqual(
            notification["message"],
            "Return for review in two weeks.",
        )

        self.assertEqual(
            notification["target_type"],
            "FollowUpAction",
        )

        self.assertEqual(
            notification["target_id"],
            "123",
        )

        self.assertEqual(
            notification["status"],
            Notification.Status.UNREAD,
        )

    def test_user_can_mark_own_notification_as_read(self):
        self.client.force_authenticate(
            user=self.user,
        )

        url = (
            f"/api/v1/notifications/"
            f"{self.notification.id}/read/"
        )

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.notification.refresh_from_db()

        self.assertEqual(
            self.notification.status,
            Notification.Status.READ,
        )

        self.assertIsNotNone(
            self.notification.read_at,
        )

    def test_marking_notification_as_read_is_idempotent(self):
        self.client.force_authenticate(
            user=self.user,
        )

        url = (
            f"/api/v1/notifications/"
            f"{self.notification.id}/read/"
        )

        first_response = self.client.post(url)

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK,
        )

        self.notification.refresh_from_db()

        first_read_at = self.notification.read_at

        second_response = self.client.post(url)

        self.assertEqual(
            second_response.status_code,
            status.HTTP_200_OK,
        )

        self.notification.refresh_from_db()

        self.assertEqual(
            self.notification.status,
            Notification.Status.READ,
        )

        self.assertEqual(
            self.notification.read_at,
            first_read_at,
        )

    def test_user_cannot_mark_other_users_notification_as_read(self):
        self.client.force_authenticate(
            user=self.user,
        )

        url = (
            f"/api/v1/notifications/"
            f"{self.other_notification.id}/read/"
        )

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.other_notification.refresh_from_db()

        self.assertEqual(
            self.other_notification.status,
            Notification.Status.UNREAD,
        )

    def test_missing_notification_returns_404(self):
        self.client.force_authenticate(
            user=self.user,
        )

        url = "/api/v1/notifications/999999/read/"

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_notification_read_endpoint_does_not_allow_delete(self):
        self.client.force_authenticate(
            user=self.user,
        )

        url = (
            f"/api/v1/notifications/"
            f"{self.notification.id}/read/"
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )