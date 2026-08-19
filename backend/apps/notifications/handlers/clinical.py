from apps.clinical.events.follow_up import FollowUpCreated
from apps.notifications.models import Notification
from apps.notifications.services import create_notification
from apps.clinical.events.encounter import EncounterCompleted

def handle_follow_up_created(event: FollowUpCreated) -> None:
    """
    Create a patient notification when a follow-up is created.
    """

    create_notification(
        recipient=event.patient_user,
        notification_type=Notification.NotificationType.FOLLOW_UP,
        title="New Follow-Up Plan",
        message=event.description,
        target_type="FollowUpAction",
        target_id=event.follow_up_id,
        metadata={
            "encounter_id": str(event.encounter_id),
            "doctor_id": str(event.doctor_id),
            "due_date": (
                str(event.due_date)
                if event.due_date
                else None
            ),
            "target": event.target,
        },
    )

def handle_encounter_completed(event: EncounterCompleted) -> None:
    """
    Create a patient notification when an encounter is completed.
    """

    create_notification(
        recipient=event.patient_user,
        notification_type=Notification.NotificationType.CLINICAL,
        title="Consultation Completed",
        message="Your clinical consultation has been completed.",
        target_type="ClinicalEncounter",
        target_id=event.encounter_id,
        metadata={
            "doctor_id": str(event.doctor_id),
            "appointment_id": str(event.appointment_id),
        },
    )