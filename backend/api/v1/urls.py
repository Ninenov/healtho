from django.urls import include, path


urlpatterns = [
    path("auth/", include("apps.accounts.api.urls")),
    path("patients/", include("apps.patients.api.urls")),
    path("emergency/", include("apps.emergency.api.urls")),
    path("clinical/", include("apps.clinical.api.urls")),
    path("records/", include("apps.records.api.urls")),
    path("appointments/", include("apps.appointments.api.urls")),
    path(
    "notifications/",
    include("apps.notifications.api.urls"),
),
]