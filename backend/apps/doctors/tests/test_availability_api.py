from datetime import time

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User
from apps.doctors.models import Doctor, DoctorAvailability


class DoctorAvailabilityAPITestCase(APITestCase):

    def setUp(self):
        self.doctor_user = User.objects.create_user(
            phone="9999999911",
            role=UserRole.DOCTOR,
        )

        self.other_doctor_user = User.objects.create_user(
            phone="9999999912",
            role=UserRole.DOCTOR,
        )

        self.patient_user = User.objects.create_user(
            phone="9999999913",
            role=UserRole.PATIENT,
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization="Cardiology",
        )

        self.other_doctor = Doctor.objects.create(
            user=self.other_doctor_user,
            specialization="Neurology",
        )

        self.availability = DoctorAvailability.objects.create(
            doctor=self.doctor,
            weekday=DoctorAvailability.Weekday.MONDAY,
            start_time=time(9, 0),
            end_time=time(17, 0),
        )

        self.url = "/api/v1/doctors/availability/"

    def test_unauthenticated_user_cannot_access_availability(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_non_doctor_cannot_access_availability(self):
        self.client.force_authenticate(
            user=self.patient_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_doctor_can_list_own_availability(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            str(self.availability.id),
        )

    def test_doctor_cannot_see_other_doctors_availability(self):
        DoctorAvailability.objects.create(
            doctor=self.other_doctor,
            weekday=DoctorAvailability.Weekday.TUESDAY,
            start_time=time(10, 0),
            end_time=time(18, 0),
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            str(self.availability.id),
        )

    def test_doctor_can_create_availability(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.post(
            self.url,
            {
                "weekday": DoctorAvailability.Weekday.WEDNESDAY,
                "start_time": "09:00:00",
                "end_time": "17:00:00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["weekday"],
            DoctorAvailability.Weekday.WEDNESDAY,
        )

        self.assertEqual(
            response.data["is_active"],
            True,
        )

    def test_doctor_can_get_availability_detail(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.get(
            f"{self.url}{self.availability.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            str(self.availability.id),
        )

    def test_doctor_can_patch_availability(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.patch(
            f"{self.url}{self.availability.id}/",
            {
                "start_time": "10:00:00",
                "end_time": "18:00:00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["start_time"],
            "10:00:00",
        )

        self.assertEqual(
            response.data["end_time"],
            "18:00:00",
        )

        self.availability.refresh_from_db()

        self.assertEqual(
            self.availability.start_time,
            time(10, 0),
        )

    def test_doctor_cannot_patch_other_doctors_availability(self):
        other_availability = DoctorAvailability.objects.create(
            doctor=self.other_doctor,
            weekday=DoctorAvailability.Weekday.TUESDAY,
            start_time=time(10, 0),
            end_time=time(18, 0),
        )

        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.patch(
            f"{self.url}{other_availability.id}/",
            {
                "start_time": "11:00:00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_doctor_can_delete_availability(self):
        self.client.force_authenticate(
            user=self.doctor_user,
        )

        response = self.client.delete(
            f"{self.url}{self.availability.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.availability.refresh_from_db()

        self.assertFalse(
            self.availability.is_active,
        )