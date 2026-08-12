HealthOS — Day 5 Complete Development Report

Project: HealthOS
Phase: Phase 1 — Foundation
Day: 5
Date: 12 August 2026
Focus: Patient Clinical Profile
Status: Complete

1. Day 5 Objective

The objective of Day 5 was to introduce the first layer of clinical patient information into HealthOS.

The implementation focused on two core clinical entities:

Allergies
Medical Conditions

The architecture was designed so that clinical information remains separate from:

Patient identity
Emergency contacts
Historical medical records
2. Architecture Decision

A dedicated clinical Django application was created.

The HealthOS domain separation is now:

patients
    │
    └── Patient identity and profile

emergency
    │
    └── Emergency contacts

clinical
    │
    └── Current/relevant clinical information

records
    │
    └── Historical clinical events and evidence

This prevents the Patient model from becoming a large monolithic medical-data model.

3. Clinical Application

Created:

apps/clinical/
│
├── api/
│   ├── __init__.py
│   ├── serializers.py
│   ├── urls.py
│   │
│   └── views/
│       ├── __init__.py
│       ├── allergies.py
│       └── conditions.py
│
├── migrations/
│   ├── __init__.py
│   ├── 0001_initial.py
│   └── 0002_*.py
│
├── admin.py
├── apps.py
├── models.py
├── tests.py
└── __init__.py

The application was registered in Django settings:

"apps.clinical"
4. Clinical Domain Model

The clinical domain currently contains:

Clinical
│
├── Allergy
│
└── MedicalCondition

Both are associated with the Patient model.

Patient
   │
   ├── Allergy
   ├── Allergy
   │
   ├── MedicalCondition
   └── MedicalCondition

This provides one-to-many relationships.

5. Allergy Model

Implemented:

class Allergy(BaseModel):
Fields
Field	Purpose
patient	Patient who has the allergy
allergen	Substance causing the allergy
reaction	Known reaction
severity	Severity of the allergy
notes	Additional information
id	UUID inherited from BaseModel
created_at	Creation timestamp
updated_at	Update timestamp
Soft-delete fields	Inherited from BaseModel
5.1 Allergy Severity

Supported values:

MILD
MODERATE
SEVERE
UNKNOWN

Example:

Allergen: Penicillin
Reaction: Skin rash
Severity: SEVERE
Notes: Previous documented reaction
6. Multiple Allergies

The system supports multiple allergies for a single patient.

Example:

Patient
│
├── Penicillin
├── Peanuts
├── Dust
└── Pollen

This is implemented using:

ForeignKey(Patient)

Therefore, each allergy is an independent database record.

The system does not overwrite an existing allergy when another allergy is added.

7. Allergy Serializer

Created:

apps/clinical/api/serializers.py

Implemented:

AllergySerializer

Exposed fields:

id
allergen
reaction
severity
notes
created_at
updated_at

The patient field is deliberately excluded.

The backend determines the patient from the authenticated user.

8. Allergy API

Implemented endpoints:

GET    /api/v1/clinical/allergies/
POST   /api/v1/clinical/allergies/

GET    /api/v1/clinical/allergies/<uuid>/
PATCH  /api/v1/clinical/allergies/<uuid>/
DELETE /api/v1/clinical/allergies/<uuid>/
API flow
JWT
 │
 ▼
Authenticated User
 │
 ▼
Patient
 │
 ▼
Patient-scoped Allergies
 │
 ▼
Serializer
 │
 ▼
Response
9. MedicalCondition Model

Implemented:

class MedicalCondition(BaseModel):
Fields
Field	Purpose
patient	Patient with the condition
name	Condition name
diagnosed_on	Diagnosis date
status	Current condition status
notes	Additional information
id	UUID inherited from BaseModel
created_at	Creation timestamp
updated_at	Update timestamp
Soft-delete fields	Inherited from BaseModel
10. Medical Condition Status

Supported statuses:

ACTIVE
RESOLVED
CHRONIC
INACTIVE
UNKNOWN

Example:

Name: Type 2 Diabetes
Diagnosed On: 2024-06-15
Status: CHRONIC
Notes: Currently managed with medication
11. Multiple Medical Conditions

A patient can have multiple medical conditions.

Example:

Patient
│
├── Type 2 Diabetes
├── Asthma
└── Migraine

Each condition is stored independently.

This allows future functionality such as:

Condition-specific records
Condition history
Doctor notes
Medication relationships
Condition status changes
12. Medical Condition Serializer

Implemented:

MedicalConditionSerializer

Exposed fields:

id
name
diagnosed_on
status
notes
created_at
updated_at

The patient field is not accepted from the client.

Ownership is assigned by the backend.

13. Medical Condition API

Implemented:

GET    /api/v1/clinical/conditions/
POST   /api/v1/clinical/conditions/

GET    /api/v1/clinical/conditions/<uuid>/
PATCH  /api/v1/clinical/conditions/<uuid>/
DELETE /api/v1/clinical/conditions/<uuid>/
14. Patient Data Isolation

Both clinical APIs use authenticated patient-scoped querysets.

The architecture is:

Request
   │
   ▼
Authentication
   │
   ▼
User
   │
   ▼
Patient
   │
   ├── Allergies
   │
   └── Medical Conditions

The API never trusts a client-supplied patient ID.

15. Cross-Patient Security

The following scenario is explicitly protected:

Patient A
   │
   └── Allergy A

Patient B
   │
   └── Allergy B

Patient A attempting:

GET /api/v1/clinical/allergies/<B's UUID>/

receives:

404 Not Found

The same protection exists for Medical Conditions.

This prevents direct access to another patient's clinical information even if an object UUID becomes known.

16. Clinical Admin

Both clinical models were registered with Django Admin.

Allergy Admin

Supports:

Patient search
Allergen search
Reaction search
Patient phone search
HealthOS UID search
Severity filtering
Creation ordering
MedicalCondition Admin

Supports:

Patient search
Condition search
Notes search
Patient phone search
HealthOS UID search
Status filtering
Diagnosis date visibility
Creation ordering
17. Database Migrations

Clinical migrations were generated and applied successfully.

The database now contains tables for:

clinical_allergies
clinical_medical_conditions

The models use the existing BaseModel infrastructure.

18. API Routing

The clinical API was registered under:

/api/v1/clinical/

Final routing:

/api/v1/
│
├── auth/
│
├── patients/
│
├── emergency/
│
└── clinical/
    │
    ├── allergies/
    │
    └── conditions/
19. Testing
Allergy Tests

Implemented tests for:

Unauthenticated access
Allergy creation
Multiple allergies
Allergy update
Allergy deletion
Cross-patient isolation
Medical Condition Tests

Implemented tests for:

Unauthenticated access
Condition creation
Multiple conditions
Condition update
Condition deletion
Cross-patient isolation
Combined Domain Testing

The following applications were tested together:

apps.patients
apps.emergency
apps.clinical

The complete domain test suite passed.

20. Final Clinical Architecture
                              HEALTHOS
                                  │
                                  ▼
                               Patient
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
        Patient Profile      Emergency Contacts     Clinical
                                                       │
                                      ┌────────────────┴────────────────┐
                                      │                                 │
                                      ▼                                 ▼
                                   Allergy                     MedicalCondition
                                      │                                 │
                              ┌───────┼───────┐                 ┌───────┼───────┐
                              ▼       ▼       ▼                 ▼       ▼       ▼
                           Allergen Reaction Severity           Name   Status  Diagnosis
                                      │                                 │
                                      ▼                                 ▼
                                    Notes                              Notes
21. Current HealthOS Domain Progress
┌──────────────────────────────────────────────┐
│                 HealthOS                     │
├──────────────────────────────────────────────┤
│ Accounts                                     │
│    └── User / Authentication             ✓   │
│                                              │
│ Patients                                     │
│    └── Patient Identity/Profile          ✓   │
│                                              │
│ Emergency                                    │
│    └── Emergency Contacts                ✓   │
│                                              │
│ Clinical                                     │
│    ├── Allergies                         ✓   │
│    └── Medical Conditions                ✓   │
│                                              │
│ Records                                      │
│    └── Historical Clinical Data          →   │
└──────────────────────────────────────────────┘
22. Day 5 Definition of Done
Requirement	Status
Clinical app created	✓
Clinical app registered	✓
Allergy model	✓
Allergy migration	✓
Allergy admin	✓
Allergy serializer	✓
Allergy API	✓
Multiple allergies	✓
MedicalCondition model	✓
MedicalCondition migration	✓
MedicalCondition admin	✓
MedicalCondition serializer	✓
MedicalCondition API	✓
Multiple conditions	✓
Authentication	✓
Patient ownership	✓
Cross-patient isolation	✓
Clinical tests	✓
Django checks	✓