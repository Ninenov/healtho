# HealthOS — Day 3 Development Report

**Date:** 12 August 2026
**Phase:** Phase 1 — Foundation
**Day:** 3
**Focus:** Patient Identity & Profile Module

---

## 1. Day 3 Objective

The objective of Day 3 was to establish the core Patient domain of HealthOS.

The Patient module is the foundation for future features including:

* Medical records
* Emergency access
* Appointments
* Prescriptions
* Medical documents
* Doctor and hospital access
* AI-assisted medical data processing

The implementation focused on creating a clean Patient identity/profile layer without mixing clinical data into the core Patient model.

---

## 2. Work Completed

### 2.1 Patient Model

The existing Patient model was extended instead of being recreated.

The Patient model now contains:

* Internal UUID inherited from `BaseModel`
* User relationship
* HealthOS UID
* Date of birth
* Gender
* Blood group
* Height
* Weight
* Profile photo
* Creation timestamp
* Update timestamp
* Soft-delete support

The model continues to inherit from:

```text
BaseModel
├── UUIDMixin
├── TimeStampedMixin
└── SoftDeleteMixin
```

This prevents duplication of common model infrastructure.

---

## 3. HealthOS UID

A separate public-facing HealthOS UID was introduced.

Example:

```text
HOS-A83F91C2
```

The UID is:

* Unique
* Indexed
* Non-editable
* Automatically generated
* Separate from the internal database UUID

The UID will eventually support features such as:

* Patient identification
* Emergency access
* QR-based identification
* Patient cards
* Hospital registration
* Medical record linking

The existing Patient records were populated with generated UIDs.

---

## 4. Database Migration

The Patient migration history was extended safely.

Final migration chain:

```text
0001_initial
      ↓
0002_patient_healthos_uid
      ↓
0003_alter_patient_healthos_uid
```

The initial UID migration temporarily allowed `NULL` values so existing Patient records could be populated safely.

After population, the field was changed to required.

An unnecessary empty migration was identified and removed.

---

## 5. Patient Serializer

The Patient serializer was updated to expose:

```text
id
healthos_uid
date_of_birth
gender
blood_group
height_cm
weight_kg
profile_photo
```

The `user` field is intentionally not exposed.

The authenticated account determines which Patient profile is accessed.

This prevents clients from directly selecting another patient's account through the API.

---

## 6. Patient Profile API

The following endpoints were implemented:

```http
GET /api/v1/patients/me/
PATCH /api/v1/patients/me/
```

### GET

Returns the authenticated user's Patient profile.

### PATCH

Allows partial updates to the Patient profile.

Example:

```json
{
    "weight_kg": "72.50",
    "height_cm": "176.00"
}
```

Partial updates are supported so the client does not need to submit the entire Patient profile.

---

## 7. Patient Selector

The Patient lookup is centralized through:

```text
apps/patients/selectors/patient.py
```

The selector resolves:

```text
Authenticated User
       ↓
get_patient_by_user()
       ↓
Patient
```

This keeps database lookup logic outside the API view.

The query also uses:

```python
select_related("user")
```

to efficiently retrieve the related User.

---

## 8. API Security

The Patient profile API requires authentication through:

```python
IsAuthenticated
```

The access flow is:

```text
Request
   ↓
Authentication
   ↓
Authenticated User
   ↓
Patient lookup
   ↓
Own Patient profile
```

Unauthenticated requests are rejected.

The API does not accept a Patient ID to retrieve arbitrary Patient profiles.

This establishes the initial patient-data isolation boundary.

---

## 9. Missing Patient Profile Handling

The API explicitly handles authenticated users who do not have an associated Patient profile.

Instead of returning:

```text
200 OK
null
```

the API returns:

```text
404 Patient profile not found
```

This provides predictable API behavior.

---

## 10. Validation

Validation was added for physical measurements.

### Height

```text
Minimum: 30 cm
Maximum: 300 cm
```

### Weight

```text
Minimum: 1 kg
Maximum: 500 kg
```

These boundaries prevent obviously invalid values from entering the Patient domain.

---

## 11. Testing

Patient API tests were added covering:

### Authentication

* Unauthenticated user cannot access the Patient profile.

### Profile retrieval

* Authenticated user can retrieve their own profile.
* HealthOS UID is returned correctly.

### Profile update

* Authenticated user can update profile information.
* Updated values are persisted.

### UID protection

* Client cannot modify the HealthOS UID through the profile API.

---

## 12. Package Structure Fix

During testing, Python test discovery exposed a package-structure issue caused by the Patient package missing its `__init__.py`.

The package structure was corrected.

The Patient tests were also consolidated into:

```text
apps/patients/tests.py
```

to avoid the namespace/package discovery conflict encountered during testing.

---

## 13. Final Patient Module Structure

```text
apps/patients/
│
├── __init__.py
│
├── api/
│   ├── serializers/
│   │   ├── __init__.py
│   │   └── patient.py
│   │
│   ├── views/
│   │   ├── __init__.py
│   │   └── profile.py
│   │
│   └── urls.py
│
├── constants/
│
├── migrations/
│   ├── 0001_initial.py
│   ├── 0002_patient_healthos_uid.py
│   ├── 0003_alter_patient_healthos_uid.py
│   └── __init__.py
│
├── models/
│   └── patient.py
│
├── selectors/
│   └── patient.py
│
└── tests.py
```

---

## 14. API Architecture

The completed flow is:

```text
                    Client
                      │
                      ▼
              /api/v1/patients/
                      │
                      ▼
                    /me/
                      │
                      ▼
          PatientProfileAPIView
                      │
             ┌────────┴────────┐
             ▼                 ▼
            GET              PATCH
             │                 │
             └────────┬────────┘
                      ▼
             get_patient_by_user()
                      │
                      ▼
                   Patient
                      │
                      ▼
              PatientSerializer
                      │
                      ▼
                  Response
```

---

## 15. Core Patient Identity Architecture

```text
                         User
                          │
                         1:1
                          │
                          ▼
                       Patient
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
 HealthOS UID       Personal Data       Profile Data
        │
        ▼
 Future HealthOS Identity Layer
```

The Patient model represents identity and basic profile information.

Clinical information will be separated into dedicated domains.

---

## 16. Deliberately Excluded From Day 3

The following were intentionally not added directly to the Patient model:

* Emergency contacts
* Allergies
* Medical conditions
* Medications
* Prescriptions
* Medical records
* Medical documents
* Appointments
* Insurance
* Emergency events

These will be implemented as separate domains/models.

This prevents the Patient model from becoming a large monolithic medical-data table.

---

## 17. Validation Checklist

| Component                | Status   |
| ------------------------ | -------- |
| PostgreSQL connection    | Complete |
| Django system check      | Passing  |
| Patient model            | Complete |
| HealthOS UID             | Complete |
| User relationship        | Complete |
| Patient serializer       | Complete |
| GET `/patients/me/`      | Complete |
| PATCH `/patients/me/`    | Complete |
| Authentication           | Complete |
| Patient selector         | Complete |
| Missing-profile handling | Complete |
| Measurement validation   | Complete |
| Patient tests            | Complete |
| Migration cleanup        | Complete |
| Package structure        | Complete |

---

## 18. Git Commit

Recommended commit:

```bash
git add apps/patients
git commit -m "feat(patients): complete patient identity and profile"
```

Final repository state should be:

```text
nothing to commit, working tree clean
```

---

## 19. Day 3 Outcome

Day 3 establishes the first complete HealthOS domain.

```text
Day 1
Foundation
   ↓
Day 2
Accounts + Domain Structure
   ↓
Day 3
Patient Identity + Profile
   ↓
Day 4
Patient Extended Domain
```

The Patient module is now ready to act as the identity anchor for future HealthOS medical domains.

---

## 20. Next Development Target

The next stage should extend the Patient domain without bloating the core Patient model.

Recommended order:

```text
Patient
   │
   ├── Emergency Contact
   │
   ├── Medical Conditions
   │
   ├── Allergies
   │
   └── Patient Preferences
          │
          ▼
     Medical Records
          │
          ▼
     Emergency System
```

The next development day should begin with **Emergency Contact**, because it directly supports HealthOS's emergency-care objective while remaining a separate domain from Patient identity.
