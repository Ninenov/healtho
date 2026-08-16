from django.urls import path

from .views.allergies import (
    AllergyDetailAPIView,
    AllergyListCreateAPIView,
)
from .views.conditions import (
    MedicalConditionDetailAPIView,
    MedicalConditionListCreateAPIView,
)
from .views.patient import DoctorPatientClinicalView
from apps.clinical.api.views.records import (
    AppointmentClinicalRecordCreateView,
)

urlpatterns = [
    path(
        "allergies/",
        AllergyListCreateAPIView.as_view(),
        name="allergy-list-create",
    ),
    path(
        "allergies/<uuid:pk>/",
        AllergyDetailAPIView.as_view(),
        name="allergy-detail",
    ),
    path(
        "conditions/",
        MedicalConditionListCreateAPIView.as_view(),
        name="medical-condition-list-create",
    ),
    path(
        "conditions/<uuid:pk>/",
        MedicalConditionDetailAPIView.as_view(),
        name="medical-condition-detail",
    ),
    path(
        "patients/<uuid:patient_id>/",
        DoctorPatientClinicalView.as_view(),
        name="doctor-patient-clinical",
    ),
    path(
        "appointments/<uuid:appointment_id>/records/",
        AppointmentClinicalRecordCreateView.as_view(),
        name="appointment-clinical-record-create",
    ),
]