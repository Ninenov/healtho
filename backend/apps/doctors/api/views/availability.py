from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.doctors.api.serializers.availability import (
    DoctorAvailabilitySerializer,
)
from apps.doctors.models import DoctorAvailability
from apps.doctors.services.availability import (
    DoctorAvailabilityService,
)


class DoctorAvailabilityListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_doctor(self, request):
        try:
            return request.user.doctor_profile
        except AttributeError:
            return None

    def get(self, request):
        doctor = self.get_doctor(request)

        if doctor is None:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        availabilities = (
            DoctorAvailability.objects
            .filter(doctor=doctor)
            .order_by("weekday", "start_time")
        )

        serializer = DoctorAvailabilitySerializer(
            availabilities,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        doctor = self.get_doctor(request)

        if doctor is None:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DoctorAvailabilitySerializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        try:
            availability = DoctorAvailabilityService.create(
                doctor=doctor,
                **serializer.validated_data,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            DoctorAvailabilitySerializer(availability).data,
            status=status.HTTP_201_CREATED,
        )


class DoctorAvailabilityDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_doctor(self, request):
        try:
            return request.user.doctor_profile
        except AttributeError:
            return None

    def get_object(self, request, availability_id):
        doctor = self.get_doctor(request)

        if doctor is None:
            return None

        return (
            DoctorAvailability.objects
            .filter(
                id=availability_id,
                doctor=doctor,
            )
            .first()
        )

    def get(self, request, availability_id):
        availability = self.get_object(
            request,
            availability_id,
        )

        if availability is None:
            return Response(
                {"detail": "Availability not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DoctorAvailabilitySerializer(
            availability,
        )

        return Response(serializer.data)

    def patch(self, request, availability_id):
        availability = self.get_object(
            request,
            availability_id,
        )

        if availability is None:
            return Response(
                {"detail": "Availability not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DoctorAvailabilitySerializer(
            availability,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        try:
            availability = DoctorAvailabilityService.update(
                availability=availability,
                **serializer.validated_data,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            DoctorAvailabilitySerializer(availability).data,
        )

    def delete(self, request, availability_id):
        availability = self.get_object(
            request,
            availability_id,
        )

        if availability is None:
            return Response(
                {"detail": "Availability not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        DoctorAvailabilityService.deactivate(
            availability=availability,
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )