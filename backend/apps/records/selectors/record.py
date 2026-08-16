from apps.appointments.models import Appointment
from apps.records.models import MedicalRecord


CLINICAL_ACCESS_STATUSES = [
    Appointment.Status.CONFIRMED,
    Appointment.Status.IN_PROGRESS,
    Appointment.Status.COMPLETED,
]


def get_patient_medical_records_for_doctor(
    *,
    doctor,
    patient,
):
    has_access = Appointment.objects.filter(
        doctor=doctor,
        patient=patient,
        status__in=CLINICAL_ACCESS_STATUSES,
    ).exists()

    if not has_access:
        return MedicalRecord.objects.none()

    return (
        MedicalRecord.objects
        .filter(patient=patient)
        .order_by("-record_date", "-created_at")
    )