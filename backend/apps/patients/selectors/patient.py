from apps.patients.models import Patient


def get_patient_by_user(user):
    return (
        Patient.objects
        .select_related("user")
        .filter(user=user)
        .first()
    )