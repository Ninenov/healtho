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

    @staticmethod
    def for_encounter(
        *,
        encounter: ClinicalEncounter,
    ):
        if not encounter:
            raise ValidationError(
                "Clinical encounter is required."
            )

        return (
            ClinicalAuditEvent.objects
            .select_related("actor", "encounter")
            .filter(encounter=encounter)
            .order_by("-created_at")
        )

    @staticmethod
    def for_doctor(
        *,
        doctor,
    ):
        if not doctor:
            raise ValidationError(
                "Doctor is required."
            )

        return (
            ClinicalAuditEvent.objects
            .select_related("actor", "encounter")
            .filter(
                encounter__doctor=doctor,
            )
            .order_by("-created_at")
        )

    @staticmethod
    def filter_events(
        *,
        encounter=None,
        action=None,
        actor=None,
    ):
        queryset = (
            ClinicalAuditEvent.objects
            .select_related("actor", "encounter")
            .all()
            .order_by("-created_at")
        )

        if encounter is not None:
            queryset = queryset.filter(
                encounter=encounter,
            )

        if action:
            queryset = queryset.filter(
                action=action,
            )

        if actor is not None:
            queryset = queryset.filter(
                actor=actor,
            )

        return queryset