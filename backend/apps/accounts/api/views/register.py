from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import RegisterSerializer, UserSerializer
from apps.accounts.api.serializers import RegisterSerializer
from apps.patients.services.patient import create_patient_profile

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        if user.role == "PATIENT":
            create_patient_profile(user)

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )
