from django.urls import path

from .views import PatientProfileAPIView

urlpatterns = [
    path(
        "profile/",
        PatientProfileAPIView.as_view(),
        name="patient-profile",
    ),
]