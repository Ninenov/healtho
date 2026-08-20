from django.apps import AppConfig


class CommonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.common"

    def ready(self):
        from apps.common.events.handlers.registry import (
            register_audit_handlers,
        )

        register_audit_handlers()