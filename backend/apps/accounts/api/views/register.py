from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.serializers import (
    RegisterSerializer,
    UserSerializer,
)


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        user = serializer.save()

        response = UserSerializer(user).data

        if hasattr(user, "doctor_profile"):
            response["verification_status"] = (
                user.doctor_profile.verification_status
            )

        return Response(
            response,
            status=status.HTTP_201_CREATED,
        )