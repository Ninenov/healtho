from django.urls import path

from apps.doctors.api.views.availability import (
    DoctorAvailabilityDetailView,
    DoctorAvailabilityListCreateView,
)
from apps.doctors.api.views.doctor import (
    DoctorDetailView,
    DoctorListView,
)
from apps.doctors.api.views.patient import (
    DoctorPatientAvailabilityView,
)


urlpatterns = [
    # Patient-facing doctor directory
    path(
        "",
        DoctorListView.as_view(),
        name="doctor-list",
    ),

    path(
        "<uuid:pk>/",
        DoctorDetailView.as_view(),
        name="doctor-detail",
    ),

    path(
        "<uuid:doctor_id>/availability/",
        DoctorPatientAvailabilityView.as_view(),
        name="doctor-patient-availability",
    ),

    # Doctor availability management
    path(
        "availability/",
        DoctorAvailabilityListCreateView.as_view(),
        name="doctor-availability-list-create",
    ),

    path(
        "availability/<uuid:availability_id>/",
        DoctorAvailabilityDetailView.as_view(),
        name="doctor-availability-detail",
    ),
]