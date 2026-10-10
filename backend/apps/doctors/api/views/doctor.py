from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.doctors.api.serializers.doctor import DoctorSerializer
from apps.doctors.models import Doctor


class DoctorListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorSerializer

    def get_queryset(self):
        queryset = (
            Doctor.objects
            .select_related("user")
            .filter(user__is_active=True)
            .order_by(
                "user__first_name",
                "user__last_name",
            )
        )

        specialization = self.request.query_params.get(
            "specialization"
        )

        if specialization:
            queryset = queryset.filter(
                specialization__icontains=specialization
            )

        return queryset


class DoctorDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorSerializer

    def get_queryset(self):
        return (
            Doctor.objects
            .select_related("user")
            .filter(user__is_active=True)
        )