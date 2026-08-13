from django.urls import path

from apps.records.api.views import (
    MedicalRecordListCreateAPIView,
    MedicalRecordDetailAPIView,
)


urlpatterns = [
    path(
        "",
        MedicalRecordListCreateAPIView.as_view(),
        name="medical-record-list-create",
    ),
    path(
        "<uuid:pk>/",
        MedicalRecordDetailAPIView.as_view(),
        name="medical-record-detail",
    ),
]