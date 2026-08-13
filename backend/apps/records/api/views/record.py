from rest_framework.exceptions import NotFound
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from apps.records.api.serializers import MedicalRecordSerializer
from apps.records.models import MedicalRecord
from apps.patients.selectors.patient import get_patient_by_user


class MedicalRecordListCreateAPIView(ListCreateAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            raise NotFound("Patient profile not found.")

        return (
            MedicalRecord.objects
            .filter(patient=patient)
            .order_by("-record_date", "-created_at")
        )

    def perform_create(self, serializer):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            raise NotFound("Patient profile not found.")

        serializer.save(patient=patient)


class MedicalRecordDetailAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient = get_patient_by_user(self.request.user)

        if patient is None:
            raise NotFound("Patient profile not found.")

        return MedicalRecord.objects.filter(patient=patient)