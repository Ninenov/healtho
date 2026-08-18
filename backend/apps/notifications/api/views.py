from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.models import Notification


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            recipient=request.user,
        ).order_by("-created_at")

        data = [
            {
                "id": notification.id,
                "notification_type": notification.notification_type,
                "title": notification.title,
                "message": notification.message,
                "target_type": notification.target_type,
                "target_id": notification.target_id,
                "status": notification.status,
                "metadata": notification.metadata,
                "created_at": notification.created_at,
                "read_at": notification.read_at,
            }
            for notification in notifications
        ]

        return Response(data)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user,
            )
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if notification.status != Notification.Status.READ:
            notification.status = Notification.Status.READ
            notification.read_at = timezone.now()

            notification.save(
                update_fields=[
                    "status",
                    "read_at",
                ]
            )

        return Response(
            {
                "id": notification.id,
                "status": notification.status,
                "read_at": notification.read_at,
            },
            status=status.HTTP_200_OK,
        )