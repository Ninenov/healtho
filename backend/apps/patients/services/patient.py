from apps.patients.models import Patient


def create_patient_profile(user):
    patient, created = Patient.objects.get_or_create(user=user)
    return patient