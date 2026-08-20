import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("healthos")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.conf.imports = (
    "apps.appointments.tasks",
    "apps.notifications.tasks",
)

app.conf.beat_schedule = {
    "process-appointment-reminders-every-5-minutes": {
        "task": "apps.appointments.tasks.process_appointment_reminders",
        "schedule": 300.0,
    },
}