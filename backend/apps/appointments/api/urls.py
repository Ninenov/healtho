from django.urls import path

from apps.appointments.api.views.appointment import (
    AppointmentDetailView,
    AppointmentListCreateView,
)
from apps.appointments.api.views.lifecycle import (
    AppointmentCancelView,
    AppointmentConfirmView,
    AppointmentStartView,
    AppointmentCompleteView,
    AppointmentNoShowView,
)
from apps.appointments.api.views.doctor import (
    DoctorAppointmentListView,
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
    path(
        "<uuid:appointment_id>/confirm/",
        AppointmentConfirmView.as_view(),
        name="appointment-confirm",
    ),
    path(
        "<uuid:appointment_id>/start/",
        AppointmentStartView.as_view(),
        name="appointment-start",
    ),
    path(
        "<uuid:appointment_id>/complete/",
        AppointmentCompleteView.as_view(),
        name="appointment-complete",
    ),
    path(
        "<uuid:appointment_id>/no-show/",
        AppointmentNoShowView.as_view(),
        name="appointment-no-show",
    ),
    path(
        "doctor/",
        DoctorAppointmentListView.as_view(),
        name="doctor-appointment-list",
    ),

]