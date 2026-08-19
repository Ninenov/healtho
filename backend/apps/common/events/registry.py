from collections.abc import Callable

from .base import DomainEvent
from .dispatcher import EventDispatcher


class EventRegistry:
    """
    Central registry for HealthOS domain event handlers.
    """

    def __init__(self) -> None:
        self.dispatcher = EventDispatcher()

    def register(
        self,
        event_type: type[DomainEvent],
        handler: Callable[[DomainEvent], None],
    ) -> None:
        self.dispatcher.register(event_type, handler)

    def dispatch(self, event: DomainEvent) -> None:
        self.dispatcher.dispatch(event)


event_registry = EventRegistry()