from apps.clinical.models import ClinicalEncounter
from apps.clinical.selectors.access import doctor_has_patient_access


class ClinicalHistoryService:

    @staticmethod
    def get_patient_history(*, doctor, patient):
        if not doctor_has_patient_access(
            doctor=doctor,
            patient=patient,
        ):
            return None

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

        history = []

        for encounter in encounters:
            history.append(
                {
                    "encounter": {
                        "id": str(encounter.id),
                        "created_at": encounter.created_at,
                        "doctor_id": str(encounter.doctor_id),
                        "chief_complaint": encounter.chief_complaint,
                        "symptoms": encounter.symptoms,
                        "examination_findings": (
                            encounter.examination_findings
                        ),
                        "assessment": encounter.assessment,
                        "plan": encounter.plan,
                        "notes": encounter.notes,
                    },
                    "diagnoses": [
                        {
                            "id": str(diagnosis.id),
                            "diagnosis": diagnosis.diagnosis,
                            "description": diagnosis.description,
                            "diagnosis_type": diagnosis.diagnosis_type,
                            "notes": diagnosis.notes,
                        }
                        for diagnosis in encounter.diagnoses.all()
                    ],
                    "prescriptions": [
                        {
                            "id": str(prescription.id),
                            "medication": prescription.medication,
                            "dosage": prescription.dosage,
                            "frequency": prescription.frequency,
                            "duration": prescription.duration,
                            "route": prescription.route,
                            "instructions": prescription.instructions,
                        }
                        for prescription in encounter.prescriptions.all()
                    ],
                    "follow_ups": [
                        {
                            "id": str(action.id),
                            "action_type": action.action_type,
                            "description": action.description,
                            "due_date": action.due_date,
                            "status": action.status,
                            "notes": action.notes,
                        }
                        for action in encounter.follow_up_actions.all()
                    ],
                }
            )

        return history