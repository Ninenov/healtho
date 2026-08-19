from uuid import UUID

from apps.common.events.base import DomainEvent


class FollowUpCreated(DomainEvent):
    """
    Event emitted when a clinical follow-up is created.
    """

    def __init__(
        self,
        follow_up_id: int,
        encounter_id: int,
        patient_id: int,
        patient_user,
        doctor_id: int,
        due_date,
        description: str,
        target: str,
    ) -> None:
        super().__init__()

        self.follow_up_id = follow_up_id
        self.encounter_id = encounter_id
        self.patient_id = patient_id
        self.patient_user = patient_user
        self.doctor_id = doctor_id
        self.due_date = due_date
        self.description = description
        self.target = target

    def to_dict(self) -> dict:
        return {
            **super().to_dict(),
            "follow_up_id": self.follow_up_id,
            "encounter_id": self.encounter_id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "due_date": (
                self.due_date.isoformat()
                if self.due_date
                else None
            ),
            "description": self.description,
            "target": self.target,
        }