from apps.clinical.events.follow_up import FollowUpCreated
from apps.common.events.registry import event_registry

from .clinical import handle_follow_up_created


def register_notification_handlers() -> None:
    event_registry.register(
        FollowUpCreated,
        handle_follow_up_created,
    )