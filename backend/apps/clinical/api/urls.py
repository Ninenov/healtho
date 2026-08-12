from django.urls import path

from .views.allergies import (
    AllergyDetailAPIView,
    AllergyListCreateAPIView,
)
from .views.conditions import (
    MedicalConditionDetailAPIView,
    MedicalConditionListCreateAPIView,
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
]