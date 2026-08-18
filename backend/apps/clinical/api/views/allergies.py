from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated

from apps.clinical.api.serializers import AllergySerializer
from apps.clinical.models.models import Allergy
from apps.patients.selectors.patient import get_patient_by_user


class AllergyListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AllergySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            return Allergy.objects.none()

        return Allergy.objects.filter(
            patient=patient,
        )

    def perform_create(self, serializer):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            raise NotFound("Patient profile not found.")

        serializer.save(patient=patient)


class AllergyDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AllergySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            return Allergy.objects.none()

        return Allergy.objects.filter(
            patient=patient,
        )
