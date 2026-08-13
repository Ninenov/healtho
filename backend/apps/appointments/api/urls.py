from django.urls import path

from apps.appointments.api.views import (
    AppointmentDetailView,
    AppointmentListCreateView,
)


urlpatterns = [
    path(
        "",
        AppointmentListCreateView.as_view(),
        name="appointment-list-create",
    ),
    path(
        "<uuid:appointment_id>/",
        AppointmentDetailView.as_view(),
        name="appointment-detail",
    ),
]