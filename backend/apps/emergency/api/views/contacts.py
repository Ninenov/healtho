from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.emergency.models import EmergencyContact
from apps.emergency.api.serializers import EmergencyContactSerializer
from apps.patients.selectors.patient import get_patient_by_user


class EmergencyContactListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            return EmergencyContact.objects.none()

        return EmergencyContact.objects.filter(
            patient=patient,
        )

    def perform_create(self, serializer):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            from rest_framework.exceptions import NotFound
            raise NotFound("Patient profile not found.")

        serializer.save(patient=patient)


class EmergencyContactDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            return EmergencyContact.objects.none()

        return EmergencyContact.objects.filter(
            patient=patient,
        )