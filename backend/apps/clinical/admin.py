from django.contrib import admin

from .models import Allergy, MedicalCondition


@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = (
        "allergen",
        "patient",
        "severity",
        "created_at",
    )

    list_filter = (
        "severity",
    )

    search_fields = (
        "allergen",
        "reaction",
        "patient__healthos_uid",
        "patient__user__phone",
    )

    ordering = (
        "allergen",
        "-created_at",
    )
    

@admin.register(MedicalCondition)
class MedicalConditionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "patient",
        "status",
        "diagnosed_on",
        "created_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "name",
        "notes",
        "patient__healthos_uid",
        "patient__user__phone",
    )

    ordering = (
        "name",
        "-created_at",
    )