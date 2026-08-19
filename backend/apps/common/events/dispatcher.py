from typing import Callable

from .base import DomainEvent


EventHandler = Callable[[DomainEvent], None]


class EventDispatcher:
    """
    Dispatches domain events to registered handlers.
    """

    def __init__(self):
        self._handlers: dict[type[DomainEvent], list[EventHandler]] = {}

    def register(
        self,
        event_type: type[DomainEvent],
        handler: EventHandler,
    ) -> None:
        self._handlers.setdefault(event_type, []).append(handler)

    def dispatch(self, event: DomainEvent) -> None:
        handlers = self._handlers.get(type(event), [])

        for handler in handlers:
            handler(event)