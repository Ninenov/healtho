HealthOS — Day 15 Report
Objective

Extend the Clinical Encounter / Consultation workflow into a complete clinical workflow by connecting encounters with:

Diagnoses
Prescriptions
Follow-up actions
Completed
1. Diagnosis Workflow

Implemented the Diagnosis model under apps/clinical.

A diagnosis is linked directly to a ClinicalEncounter.

It stores:

Diagnosis
Description
Diagnosis type
Notes

Supported diagnosis types:

PRIMARY
SECONDARY

Business validation ensures diagnoses can only be created during an active consultation.

2. Diagnosis Service

Implemented:

apps/clinical/services/diagnosis.py

The service handles:

ClinicalEncounter
        ↓
Appointment validation
        ↓
IN_PROGRESS
        ↓
Create Diagnosis
3. Diagnosis API

Implemented doctor-facing endpoints:

POST /api/v1/clinical/encounters/<encounter_id>/diagnoses/


GET /api/v1/clinical/encounters/<encounter_id>/diagnoses/

The API derives authorization from the encounter's doctor rather than trusting client-supplied doctor IDs.

4. Diagnosis Security

Protected against:

Unauthenticated users
Patients accessing diagnoses
Other doctors accessing encounters
Doctors accessing another doctor's clinical data
Diagnoses outside active consultations
Missing required diagnosis data

A routing issue involving UUID-based encounter IDs was identified and corrected:

<int:encounter_id>

was changed to:

<uuid:encounter_id>

This restored the correct API routing.

5. Prescription Workflow

Added Prescription to apps/clinical/models.py.

It stores:

Medication
Dosage
Frequency
Duration
Route
Instructions

The prescribing doctor is derived through:

Prescription
    ↓
ClinicalEncounter
    ↓
Doctor

This avoids duplicating doctor identity and prevents inconsistent clinical ownership.

6. Prescription Service

Implemented:

apps/clinical/services/prescription.py

Business rule:

Correct doctor
      ↓
Own encounter
      ↓
Appointment IN_PROGRESS
      ↓
Create prescription
7. Prescription API

Implemented:

POST /api/v1/clinical/encounters/<encounter_id>/prescriptions/


GET /api/v1/clinical/encounters/<encounter_id>/prescriptions/

Added UUID-based routing and doctor authorization.

8. Follow-Up Action Workflow

Added FollowUpAction to apps/clinical/models.py.

Supported action types:

FOLLOW_UP
LAB_TEST
REFERRAL
PROCEDURE
OTHER

Supported statuses:

PENDING
COMPLETED
CANCELLED

Fields include:

Action type
Description
Due date
Status
Notes
9. Follow-Up Service

Implemented:

apps/clinical/services/follow_up.py

Follow-up actions are restricted to active consultations and require a valid clinical encounter.

10. Follow-Up API

Implemented:

POST /api/v1/clinical/encounters/<encounter_id>/follow-ups/


GET /api/v1/clinical/encounters/<encounter_id>/follow-ups/

Authorization follows the same doctor → encounter ownership model established during Day 14.

Testing

Added dedicated API tests for:

test_diagnosis_api.py
test_prescription_api.py
test_follow_up_api.py

Coverage includes:

Successful creation
Data persistence
Data retrieval
Doctor authorization
Wrong-doctor protection
Patient protection
Unauthenticated access
Active consultation restrictions
Required-field validation
Multiple clinical objects per encounter
Correct encounter relationships

The existing Day 14 encounter tests were also preserved.

Architecture After Day 15
Appointment
    │
    ├── Patient
    ├── Doctor
    │
    └── ClinicalEncounter
            │
            ├── Chief Complaint
            ├── Symptoms
            ├── Examination
            ├── Assessment
            ├── Plan
            ├── Notes
            │
            ├── Diagnosis
            │     ├── Primary
            │     └── Secondary
            │
            ├── Prescription
            │     ├── Medication
            │     ├── Dosage
            │     ├── Frequency
            │     ├── Duration
            │     ├── Route
            │     └── Instructions
            │
            └── FollowUpAction
                  ├── Follow-up
                  ├── Lab Test
                  ├── Referral
                  ├── Procedure
                  └── Other
Complete Clinical Workflow
Appointment
     ↓
Clinical Encounter
     ↓
Clinical Assessment
     ↓
Diagnosis
     ↓
Prescription
     ↓
Follow-Up
Key Architectural Improvements

Day 15 transformed the encounter from a clinical note into a structured consultation workflow.

The system now separates:

Encounter
    = What happened during consultation


Diagnosis
    = What was identified


Prescription
    = What treatment was prescribed


Follow-Up
    = What needs to happen next

This creates a much stronger foundation for future modules such as medical history, medication tracking, lab results, referrals, notifications, and longitudinal patient records.

Status

Day 15: COMPLETE

Milestone

Core Clinical Consultation Workflow implemented.

HealthOS now has:

Day 13
Clinical Patient Profile
        ↓
Day 14
Clinical Encounter
        ↓
Day 15
Diagnosis + Prescription + Follow-Up
Next — Day 16

Focus on clinical workflow completion and longitudinal records:

Clinical Encounter
      ↓
Diagnoses
      ↓
Prescriptions
      ↓
Follow-Up
      ↓
Clinical History / Timeline

The next major goal should be making the patient's clinical information usable as a longitudinal medical timeline, rather than just a collection of isolated records.