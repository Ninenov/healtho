from apps.common.events.base import DomainEvent


class EncounterCompleted(DomainEvent):
    """
    Event emitted when a clinical encounter is completed.
    """

    def __init__(
        self,
        *,
        encounter_id: int,
        patient_id: int,
        patient_user,
        doctor_id: int,
        appointment_id: int,
    ) -> None:
        super().__init__()

        self.encounter_id = encounter_id
        self.patient_id = patient_id
        self.patient_user = patient_user
        self.doctor_id = doctor_id
        self.appointment_id = appointment_id

    def to_dict(self) -> dict:
        return {
            **super().to_dict(),
            "encounter_id": self.encounter_id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "appointment_id": self.appointment_id,
        }