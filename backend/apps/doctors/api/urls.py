from django.urls import path

from apps.doctors.api.views.availability import (
    DoctorAvailabilityDetailView,
    DoctorAvailabilityListCreateView,
)

urlpatterns = [
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