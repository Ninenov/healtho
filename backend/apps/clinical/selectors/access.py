from apps.appointments.models import Appointment


CLINICAL_ACCESS_STATUSES = [
    Appointment.Status.CONFIRMED,
    Appointment.Status.IN_PROGRESS,
    Appointment.Status.COMPLETED,
]


def doctor_has_patient_access(*, doctor, patient):
    return Appointment.objects.filter(
        doctor=doctor,
        patient=patient,
        status__in=CLINICAL_ACCESS_STATUSES,
    ).exists()