HealthOS — Day 12 Report

Focus: Clinical Access Control & Doctor–Patient Clinical Records

Objective

Build a secure clinical-access workflow where doctors can create and work with a patient's clinical records only through a legitimate patient–doctor consultation, rather than giving every doctor unrestricted access to patient data.

Work Completed
1. Clinical Record Access Architecture

Implemented the separation between:

Patient
   ↓
Appointment
   ↓
Doctor
   ↓
Clinical Record

The appointment acts as the access boundary.

A doctor does not automatically gain access to every patient's records.

2. Clinical Record Creation

Implemented the clinical record creation flow through an appointment.

A doctor can create a record when:

Doctor = appointment.doctor
AND
Appointment.status = IN_PROGRESS

The created record is automatically associated with:

appointment.patient

This prevents the doctor/client from arbitrarily assigning a record to another patient.

3. Appointment-Based Authorization

Added validation for the consultation lifecycle.

Clinical record creation is rejected when the appointment is:

SCHEDULED
CONFIRMED
COMPLETED
CANCELLED
Associated with another doctor

Only an active:

IN_PROGRESS

consultation allows clinical record creation.

4. Clinical API Layer

Added the doctor-facing clinical record endpoint:

POST
/api/v1/clinical/appointments/<appointment_id>/records/

The API:

Authenticates the user.
Identifies the doctor profile.
Retrieves the appointment.
Validates the submitted record.
Passes creation to ClinicalRecordService.
Returns the created medical record.

This keeps business rules inside the service layer rather than inside the API view.

5. Test Coverage

Added/updated tests covering:

Doctor creating a record during an active consultation.
Wrong doctor attempting access.
Invalid appointment states.
Patient ownership of created records.
API-level clinical record creation.
Unauthorized access scenarios.
Validation

Final verification passed:

python manage.py test --keepdb

Result: All tests passed.

Also verified:

git --no-pager diff --check

Result: No formatting errors.

Architecture After Day 12
                    ┌──────────────┐
                    │    Patient   │
                    └──────┬───────┘
                           │
                           │ owns
                           ▼
                    ┌──────────────┐
                    │Clinical Data │
                    └──────────────┘
                           ▲
                           │
                    authorized through
                           │
                    ┌──────┴───────┐
                    │ Appointment  │
                    └──────┬───────┘
                           │
                           │ assigned to
                           ▼
                    ┌──────────────┐
                    │    Doctor    │
                    └──────────────┘
Key Design Decision

HealthOS does not use "doctor can see all patient records" as the access model.

Instead:

A legitimate doctor–patient relationship established through an appointment determines clinical access.

This gives us a much stronger foundation for future features such as prescriptions, diagnoses, lab reports, encounter notes, audit logs, and eventually more granular consent/access controls.

Day 12 Status

Clinical Access Control — COMPLETE

Test Suite — PASS

Doctor → Patient Clinical Workflow — READY

Day 13 Direction

Next we should build on this foundation rather than redesigning it: clinical encounter/consultation records and doctor workflow, including how a doctor views the patient's existing clinical history during an active consultation.