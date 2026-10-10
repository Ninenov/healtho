from rest_framework.permissions import BasePermission

from apps.accounts.constants.user_roles import UserRole
from apps.doctors.models import Doctor


class IsDoctor(BasePermission):
    message = "Doctor access is required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.DOCTOR
        )


class IsVerifiedDoctor(BasePermission):
    message = "Doctor verification is required."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role != UserRole.DOCTOR:
            return False

        try:
            doctor = request.user.doctor_profile
        except Doctor.DoesNotExist:
            return False

        return (
            doctor.verification_status
            == Doctor.VerificationStatus.VERIFIED
        )