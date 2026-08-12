from django.urls import path

from .views.contacts import (
    EmergencyContactDetailAPIView,
    EmergencyContactListCreateAPIView,
)


urlpatterns = [
    path(
        "contacts/",
        EmergencyContactListCreateAPIView.as_view(),
        name="emergency-contact-list-create",
    ),
    path(
        "contacts/<uuid:pk>/",
        EmergencyContactDetailAPIView.as_view(),
        name="emergency-contact-detail",
    ),
]