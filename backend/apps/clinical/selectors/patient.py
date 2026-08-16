from apps.appointments.models import Appointment
from apps.patients.models import Patient


def get_patient_clinical_context(*, doctor, appointment_id):
    appointment = (
        Appointment.objects
        .select_related("patient", "doctor")
        .filter(
            id=appointment_id,
            doctor=doctor,
        )
        .first()
    )

    if appointment is None:
        return None

    patient = appointment.patient

    return {
        "appointment": appointment,
        "patient": patient,
    }