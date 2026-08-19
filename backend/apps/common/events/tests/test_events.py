from django.test import SimpleTestCase

from apps.common.events.base import DomainEvent
from apps.common.events.registry import EventRegistry


class TestEvent(DomainEvent):
    pass


class EventInfrastructureTests(SimpleTestCase):

    def test_event_has_identity_and_timestamp(self):
        event = TestEvent()

        self.assertIsNotNone(event.event_id)
        self.assertIsNotNone(event.occurred_at)
        self.assertEqual(event.event_name, "TestEvent")

    def test_event_registry_dispatches_to_registered_handler(self):
        registry = EventRegistry()
        received = []

        def handler(event):
            received.append(event)

        registry.register(TestEvent, handler)

        event = TestEvent()
        registry.dispatch(event)

        self.assertEqual(received, [event])

    def test_event_registry_supports_multiple_handlers(self):
        registry = EventRegistry()
        received = []

        def first_handler(event):
            received.append("first")

        def second_handler(event):
            received.append("second")

        registry.register(TestEvent, first_handler)
        registry.register(TestEvent, second_handler)

        registry.dispatch(TestEvent())

        self.assertEqual(
            received,
            ["first", "second"],
        )

    def test_event_without_registered_handler_does_not_fail(self):
        registry = EventRegistry()

        registry.dispatch(TestEvent())