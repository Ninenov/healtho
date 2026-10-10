from django.urls import path

from apps.records.api.views import (
    MedicalRecordListCreateAPIView,
    MedicalRecordDetailAPIView,
    MedicalRecordDocumentDownloadAPIView,

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
    path(
        "<uuid:pk>/document/",
        MedicalRecordDocumentDownloadAPIView.as_view(),
        name="medical-record-document-download",
    ),
]