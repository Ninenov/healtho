# HealthOS — Day 4 Development Report

**Date:** 12 August 2026
**Phase:** Phase 1 — Foundation
**Day:** 4
**Focus:** Emergency Contact Domain

---

## 1. Day 4 Objective

The objective of Day 4 was to extend the Patient domain with an independent **Emergency Contact system**.

The emergency functionality was intentionally placed in the existing `emergency` application rather than inside the Patient model.

This establishes a scalable foundation for future HealthOS emergency features.

---

## 2. Architecture Decision

Emergency contacts were separated from the Patient identity model.

Instead of:

```text
Patient
├── emergency_contact_name
├── emergency_contact_phone
└── emergency_contact_relation
```

HealthOS now uses:

```text
Patient
   │
   └── EmergencyContact
          ├── Name
          ├── Phone
          ├── Relationship
          └── Primary Status
```

This allows each patient to have multiple emergency contacts.

---

# 3. Emergency Application

The existing Emergency application was converted from a scaffold into a functional domain.

Final structure:

```text
apps/emergency/
│
├── api/
│   ├── __init__.py
│   ├── serializers.py
│   ├── urls.py
│   │
│   └── views/
│       ├── __init__.py
│       └── contacts.py
│
├── migrations/
│   ├── 0001_initial.py
│   └── __init__.py
│
├── models.py
├── admin.py
├── apps.py
├── tests.py
├── views.py
└── __init__.py
```

The root `views.py` is retained as a compatibility placeholder.

The actual API views are located under:

```text
apps/emergency/api/views/
```

This follows the API structure already established by the Patient module.

---

# 4. EmergencyContact Model

The following fields were implemented:

```text
EmergencyContact
│
├── UUID
├── Patient
├── Name
├── Phone
├── Relationship
├── Is Primary
├── Created At
├── Updated At
└── Soft Delete
```

The model inherits from:

```text
BaseModel
├── UUIDMixin
├── TimeStampedMixin
└── SoftDeleteMixin
```

This maintains consistency with the rest of HealthOS.

---

# 5. Patient Relationship

Emergency contacts are connected to Patient using a foreign key.

```text
Patient
   │
   │ 1:N
   ▼
EmergencyContact
```

A patient can therefore have multiple contacts.

Example:

```text
Patient
│
├── Mother       → Primary
├── Father
└── Sibling
```

The reverse relationship is:

```python
patient.emergency_contacts
```

---

# 6. Relationship Choices

The Emergency Contact model supports:

```text
Parent
Spouse
Sibling
Child
Friend
Relative
Other
```

This prevents arbitrary relationship values from entering the database through normal model validation.

---

# 7. Phone Validation

Emergency contact phone numbers have validation applied.

The accepted format supports:

```text
10–15 digits
```

with an optional `+` prefix.

Examples:

```text
9876543210
+919876543210
```

Invalid phone formats are rejected by model validation.

---

# 8. Primary Emergency Contact

Each EmergencyContact has:

```text
is_primary
```

This allows HealthOS to identify the contact that should receive priority during an emergency.

Example:

```text
Patient
│
├── Mother      is_primary = True
├── Father      is_primary = False
└── Sibling     is_primary = False
```

A future emergency workflow can use this field to determine the first contact to prioritize.

---

# 9. Emergency Contact Serializer

Created:

```text
apps/emergency/api/serializers.py
```

The API exposes:

```text
id
name
phone
relationship
is_primary
created_at
updated_at
```

The `patient` field is deliberately not exposed.

The server determines the Patient from the authenticated account.

This prevents clients from attempting to assign an emergency contact to another patient.

---

# 10. Emergency Contact API

Implemented endpoints:

```http
GET    /api/v1/emergency/contacts/
POST   /api/v1/emergency/contacts/

GET    /api/v1/emergency/contacts/<uuid>/
PATCH  /api/v1/emergency/contacts/<uuid>/
DELETE /api/v1/emergency/contacts/<uuid>/
```

---

# 11. List/Create API

Implemented:

```text
EmergencyContactListCreateAPIView
```

Responsibilities:

```text
GET
 ↓
Find authenticated Patient
 ↓
Return only their emergency contacts
```

and:

```text
POST
 ↓
Find authenticated Patient
 ↓
Create contact
 ↓
Automatically assign Patient
```

The client never supplies the Patient relationship.

---

# 12. Detail API

Implemented:

```text
EmergencyContactDetailAPIView
```

Supports:

```text
GET
PATCH
DELETE
```

The queryset is restricted to the authenticated Patient.

This prevents direct access to another patient's contact even if its UUID is known.

---

# 13. Security Architecture

The security flow is:

```text
Request
   │
   ▼
Authentication
   │
   ▼
Authenticated User
   │
   ▼
Patient
   │
   ▼
Patient-scoped queryset
   │
   ▼
Emergency Contact
```

The system does not simply query:

```text
EmergencyContact.objects.get(id=...)
```

without ownership filtering.

Instead:

```text
EmergencyContact
    WHERE patient = authenticated_patient
```

is used.

---

# 14. Cross-Patient Isolation

A dedicated security test was added to verify:

```text
Patient A
   │
   └── Contact A

Patient B
   │
   └── Contact B
```

Patient A attempting to access Contact B receives:

```text
404 Not Found
```

This is an important security boundary for HealthOS's medical-data architecture.

---

# 15. Django Admin

EmergencyContact was registered with Django Admin.

Admin capabilities include:

* Search by contact name
* Search by phone
* Search by HealthOS UID
* Search by patient phone
* Filter by relationship
* Filter by primary status
* Ordering by primary status and creation time

This provides basic administrative visibility during development.

---

# 16. Testing

Emergency Contact tests cover:

### Authentication

```text
Unauthenticated access → 401
```

### Creation

```text
Patient → creates own emergency contact
```

### Listing

```text
Patient → sees own contacts
```

### Updating

```text
Patient → updates own contact
```

### Deletion

```text
Patient → deletes own contact
```

### Cross-patient isolation

```text
Patient A → Contact B → 404
```

Final Emergency test result:

```text
Found 6 test(s).

......

Ran 6 tests

OK
```

Patient and Emergency tests were also executed together successfully.

---

# 17. Migration

Created:

```text
apps/emergency/migrations/0001_initial.py
```

The migration creates the `EmergencyContact` table.

Database migration was successfully applied.

---

# 18. Final Day 4 Architecture

```text
                         HEALTHOS
                            │
                            ▼
                         Account
                            │
                            ▼
                         Patient
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
        Patient Profile            Emergency Domain
                                      │
                                      ▼
                              EmergencyContact
                                      │
                           ┌──────────┼──────────┐
                           ▼          ▼          ▼
                         Name       Phone    Relationship
                                      │
                                      ▼
                                  Is Primary
```

---

# 19. API Architecture

```text
Client
  │
  ▼
/api/v1/emergency/
  │
  ▼
urls.py
  │
  ├── contacts/
  │      │
  │      └── ListCreateAPIView
  │
  └── contacts/<uuid>/
         │
         └── DetailAPIView
                │
                ▼
          Patient Selector
                │
                ▼
             Patient
                │
                ▼
        EmergencyContact
                │
                ▼
           Serializer
                │
                ▼
            Response
```

---

# 20. Validation Checklist

| Component               | Status   |
| ----------------------- | -------- |
| Emergency app           | Complete |
| EmergencyContact model  | Complete |
| Patient relationship    | Complete |
| Phone validation        | Complete |
| Relationship choices    | Complete |
| Primary contact         | Complete |
| Migration               | Complete |
| Admin                   | Complete |
| Serializer              | Complete |
| List API                | Complete |
| Create API              | Complete |
| Detail API              | Complete |
| Update API              | Complete |
| Delete API              | Complete |
| Authentication          | Complete |
| Patient scoping         | Complete |
| Cross-patient isolation | Complete |
| Tests                   | Complete |
| Django check            | Passing  |

---

# 21. Git Checkpoint

Recommended commit:

```bash
git add apps/patients apps/emergency api/v1/urls.py
```

```bash
git commit -m "feat(emergency): add patient emergency contacts"
```

Verify:

```bash
git status
```

Expected:

```text
nothing to commit, working tree clean
```

---

# 22. Day 4 Outcome

Day 4 transformed the Emergency application from a scaffold into a functional, authenticated, patient-scoped domain.

HealthOS now has:

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
Emergency Contacts
```

The Patient identity system and Emergency Contact system now provide the foundation required for future emergency-care workflows.

---

# 23. Next Development Target

The next major area should be the **Patient Clinical Profile**.

Recommended progression:

```text
Patient
   │
   ├── Identity ✓
   │
   ├── Profile ✓
   │
   ├── Emergency Contacts ✓
   │
   └── Clinical Profile
          │
          ├── Allergies
          ├── Medical Conditions
          ├── Medications
          └── Other relevant health information
```

Clinical information should remain separate from the core Patient identity model so the system can later support proper medical-record ownership, doctor access, hospital access, audit trails, and emergency authorization.
