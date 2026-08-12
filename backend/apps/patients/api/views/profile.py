from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound

from apps.patients.api.serializers import PatientSerializer
from apps.patients.selectors.patient import get_patient_by_user


class PatientProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient = get_patient_by_user(request.user)

        if patient is None:
            raise NotFound("Patient profile not found.")
        
        serializer = PatientSerializer(patient)

        return Response(serializer.data)

    def patch(self, request):
        patient = get_patient_by_user(request.user)

        if patient is None:
            raise NotFound("Patient profile not found.")

        serializer = PatientSerializer(
            patient,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)