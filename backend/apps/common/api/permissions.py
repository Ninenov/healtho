from rest_framework.permissions import BasePermission

from apps.accounts.constants.user_roles import UserRole


class CanViewAuditLogs(BasePermission):
    """
    Allows access to system audit logs for administrative roles.
    """

    message = "You do not have permission to view audit logs."

    allowed_roles = {
        UserRole.ADMIN,
        UserRole.HOSPITAL,
    }

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.role in self.allowed_roles