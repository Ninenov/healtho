from django.urls import path

from .views import PatientProfileAPIView


urlpatterns = [
    path(
        "me/",
        PatientProfileAPIView.as_view(),
        name="patient-profile",
    ),
]