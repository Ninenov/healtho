from apps.common.events.base import DomainEvent


class AppointmentConfirmed(DomainEvent):
    """
    Event emitted when an appointment is confirmed.
    """

    def __init__(
        self,
        *,
        appointment_id: int,
        patient_id: int,
        patient_user,
        doctor_id: int,
        scheduled_at,
        appointment_type: str,
    ) -> None:
        super().__init__()

        self.appointment_id = appointment_id
        self.patient_id = patient_id
        self.patient_user = patient_user
        self.doctor_id = doctor_id
        self.scheduled_at = scheduled_at
        self.appointment_type = appointment_type

    def to_dict(self) -> dict:
        return {
            **super().to_dict(),
            "appointment_id": self.appointment_id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "scheduled_at": (
                self.scheduled_at.isoformat()
                if self.scheduled_at
                else None
            ),
            "appointment_type": self.appointment_type,
        }

from apps.common.events.base import DomainEvent


class AppointmentConfirmed(DomainEvent):
    """
    Event emitted when an appointment is confirmed.
    """

    def __init__(
        self,
        *,
        appointment_id: int,
        patient_id: int,
        patient_user,
        doctor_id: int,
        scheduled_at,
        appointment_type: str,
    ) -> None:
        super().__init__()

        self.appointment_id = appointment_id
        self.patient_id = patient_id
        self.patient_user = patient_user
        self.doctor_id = doctor_id
        self.scheduled_at = scheduled_at
        self.appointment_type = appointment_type

    def to_dict(self) -> dict:
        return {
            **super().to_dict(),
            "appointment_id": self.appointment_id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "scheduled_at": (
                self.scheduled_at.isoformat()
                if self.scheduled_at
                else None
            ),
            "appointment_type": self.appointment_type,
        }


class AppointmentCancelled(DomainEvent):
    """
    Event emitted when an appointment is cancelled.
    """

    def __init__(
        self,
        *,
        appointment_id: int,
        patient_id: int,
        patient_user,
        doctor_id: int,
        scheduled_at,
        appointment_type: str,
    ) -> None:
        super().__init__()

        self.appointment_id = appointment_id
        self.patient_id = patient_id
        self.patient_user = patient_user
        self.doctor_id = doctor_id
        self.scheduled_at = scheduled_at
        self.appointment_type = appointment_type

    def to_dict(self) -> dict:
        return {
            **super().to_dict(),
            "appointment_id": self.appointment_id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "scheduled_at": (
                self.scheduled_at.isoformat()
                if self.scheduled_at
                else None
            ),
            "appointment_type": self.appointment_type,
        }