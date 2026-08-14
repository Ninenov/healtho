from django.urls import path

from apps.appointments.api.views.appointment import (
    AppointmentDetailView,
    AppointmentListCreateView,
)
from apps.appointments.api.views.lifecycle import (
    AppointmentCancelView,
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
    path(
        "<uuid:appointment_id>/cancel/",
        AppointmentCancelView.as_view(),
        name="appointment-cancel",
    ),
]