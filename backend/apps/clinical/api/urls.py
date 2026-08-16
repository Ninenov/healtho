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
from apps.clinical.api.views.encounters import (
    ClinicalEncounterView,
)
from apps.clinical.api.views.diagnoses import DiagnosisListCreateView
from apps.clinical.api.views.prescriptions import (
    PrescriptionListCreateView,
)
from apps.clinical.api.views.follow_ups import (
    FollowUpActionListCreateView,
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
    path(
        "appointments/<uuid:appointment_id>/encounter/",
        ClinicalEncounterView.as_view(),
        name="clinical-encounter",
    ),
    path(
        "encounters/<uuid:encounter_id>/diagnoses/",
        DiagnosisListCreateView.as_view(),
        name="encounter-diagnoses",
    ),
    path(
        "encounters/<uuid:encounter_id>/prescriptions/",
        PrescriptionListCreateView.as_view(),
        name="encounter-prescriptions",
    ),
    path(
        "encounters/<uuid:encounter_id>/follow-ups/",
        FollowUpActionListCreateView.as_view(),
        name="encounter-follow-ups",
    ),
]