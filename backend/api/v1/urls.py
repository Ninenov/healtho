from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.accounts.api.urls")),
    path("patients/", include("apps.patients.api.urls")),
]