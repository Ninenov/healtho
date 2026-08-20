from django.urls import path

from apps.common.api.views import (
    AuditLogDetailView,
    AuditLogListView,
)

urlpatterns = [
    path("", AuditLogListView.as_view(), name="audit-list"),
    path(
        "<int:pk>/",
        AuditLogDetailView.as_view(),
        name="audit-detail",
    ),
]