from apps.clinical.models.models import (
    Allergy,
    ClinicalEncounter,
    MedicalCondition,
)
from apps.clinical.selectors.access import doctor_has_patient_access
from apps.records.models import MedicalRecord


class ClinicalContextService:

    @staticmethod
    def get_patient_context(*, doctor, patient):
        if not doctor_has_patient_access(
            doctor=doctor,
            patient=patient,
        ):
            return None

        allergies = Allergy.objects.filter(
            patient=patient,
        ).order_by("allergen")

        medical_conditions = MedicalCondition.objects.filter(
            patient=patient,
        ).order_by("name")

        medical_records = (
            MedicalRecord.objects
            .filter(patient=patient)
            .order_by("-record_date", "-created_at")
        )

        encounters = (
            ClinicalEncounter.objects
            .filter(patient=patient)
            .select_related(
                "doctor",
                "appointment",
            )
            .prefetch_related(
                "diagnoses",
                "prescriptions",
                "follow_up_actions",
            )
            .order_by("-created_at")
        )

        return {
            "patient": patient,
            "allergies": allergies,
            "medical_conditions": medical_conditions,
            "medical_records": medical_records,
            "encounters": encounters,
        }
