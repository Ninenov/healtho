from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated

from apps.clinical.api.serializers import MedicalConditionSerializer
from apps.clinical.models import MedicalCondition
from apps.patients.selectors.patient import get_patient_by_user


class MedicalConditionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MedicalConditionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            return MedicalCondition.objects.none()

        return MedicalCondition.objects.filter(
            patient=patient,
        )

    def perform_create(self, serializer):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            raise NotFound("Patient profile not found.")

        serializer.save(patient=patient)


class MedicalConditionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicalConditionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            return MedicalCondition.objects.none()

        return MedicalCondition.objects.filter(
            patient=patient,
        )