from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.patients.api.serializers import PatientSerializer
from apps.patients.selectors.patient import get_patient_by_user


class PatientProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient = get_patient_by_user(request.user)

        serializer = PatientSerializer(patient)

        return Response(serializer.data)