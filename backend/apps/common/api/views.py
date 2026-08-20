from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from apps.common.api.permissions import CanViewAuditLogs
from apps.common.api.serializers import AuditLogSerializer
from apps.common.models.audit import AuditLog


class AuditLogPagination(PageNumberPagination):
    page_size = 20


class AuditLogListView(ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [
        IsAuthenticated,
        CanViewAuditLogs,
    ]
    pagination_class = AuditLogPagination

    def get_queryset(self):
        queryset = AuditLog.objects.select_related("actor").all()

        action = self.request.query_params.get("action")
        target_type = self.request.query_params.get("target_type")
        target_id = self.request.query_params.get("target_id")
        actor = self.request.query_params.get("actor")

        if action:
            queryset = queryset.filter(action=action)

        if target_type:
            queryset = queryset.filter(target_type=target_type)

        if target_id:
            queryset = queryset.filter(target_id=target_id)

        if actor:
            queryset = queryset.filter(actor_id=actor)

        return queryset.order_by("-created_at")


class AuditLogDetailView(RetrieveAPIView):
    queryset = AuditLog.objects.select_related("actor").all()
    serializer_class = AuditLogSerializer
    permission_classes = [
        IsAuthenticated,
        CanViewAuditLogs,
    ]