from django.core.exceptions import ValidationError

from apps.common.models.audit import AuditLog


class AuditService:

    @staticmethod
    def log(
        *,
        action: str,
        target_type: str,
        target_id,
        actor=None,
        metadata=None,
    ) -> AuditLog:

        if action not in AuditLog.Action.values:
            raise ValidationError(
                "Invalid audit action."
            )

        if not target_type:
            raise ValidationError(
                "Audit target type is required."
            )

        if target_id is None:
            raise ValidationError(
                "Audit target ID is required."
            )

        return AuditLog.objects.create(
            actor=actor,
            action=action,
            target_type=target_type,
            target_id=str(target_id),
            metadata=metadata or {},
        )