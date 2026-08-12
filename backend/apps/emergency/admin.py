from django.contrib import admin

from .models import EmergencyContact


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "phone",
        "relationship",
        "patient",
        "is_primary",
        "created_at",
    )

    list_filter = (
        "relationship",
        "is_primary",
    )

    search_fields = (
        "name",
        "phone",
        "patient__healthos_uid",
        "patient__user__phone",
    )

    ordering = (
        "-is_primary",
        "-created_at",
    )