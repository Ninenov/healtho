from django.core.exceptions import ValidationError

from apps.clinical.models.models import (
    ClinicalAuditEvent,
    ClinicalEncounter,
)


class ClinicalAuditService:

    @staticmethod
    def log(
        *,
        actor,
        encounter: ClinicalEncounter,
        action: str,
        target_type: str,
        target_id,
        metadata=None,
    ) -> ClinicalAuditEvent:
        if not actor:
            raise ValidationError("Audit actor is required.")

        if not encounter:
            raise ValidationError("Clinical encounter is required.")

        if action not in ClinicalAuditEvent.Action.values:
            raise ValidationError("Invalid clinical audit action.")

        return ClinicalAuditEvent.objects.create(
            actor=actor,
            encounter=encounter,
            action=action,
            target_type=target_type,
            target_id=str(target_id),
            metadata=metadata or {},
        )