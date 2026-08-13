HealthOS — Day 7 Report
1. Day 7 Objective

Primary objective: Build and validate the Appointments module and establish the required Doctor foundation for appointment scheduling.

Day 7 followed the dependency chain:

Patient
   ↓
Doctor
   ↓
Appointments

The existing HealthOS architecture was preserved by keeping authentication in accounts.User and using domain-specific profiles for Patient and Doctor.

2. Starting State

At the beginning of Day 7:

Patient foundation was already implemented.
Emergency Contacts were already implemented.
Clinical Profile was complete.
Health Records were complete.
apps/doctors existed only as an untouched scaffold.
apps/appointments already existed as a scaffold.
UserRole.DOCTOR was already defined in the Accounts module.
Patient ownership was already resolved through get_patient_by_user().

The key architectural discovery was:

accounts.User
├── PATIENT
├── DOCTOR
├── HOSPITAL
└── ADMIN

There was no existing Doctor domain model.

3. Doctor Foundation

Because Appointments require a real Doctor entity, the existing apps/doctors scaffold was implemented first.

Structure
apps/doctors/
├── models/
│   ├── __init__.py
│   └── doctor.py
├── tests/
│   ├── __init__.py
│   └── test_models.py
├── api/
├── permissions/
├── selectors/
├── services/
├── admin.py
├── apps.py
├── models.py
└── views.py

The original apps/doctors/tests.py scaffold was removed to avoid the same Python test-discovery conflict previously encountered in Records.

4. Doctor Model

The Doctor profile follows the same domain-profile pattern as Patient.

User
 │
 ├── patient_profile → Patient
 │
 └── doctor_profile  → Doctor
Doctor fields
Doctor
├── id
├── user
├── specialization
├── qualification
├── license_number
├── created_at
└── updated_at

The model inherits from:

BaseModel
├── UUIDMixin
├── TimeStampedMixin
└── SoftDeleteMixin
Doctor/User relationship
Doctor.user
      ↓
accounts.User

The relationship is one-to-one:

related_name="doctor_profile"

This allows:

user.doctor_profile

to retrieve the Doctor profile.

5. Doctor Role Validation

A Doctor profile must belong to a user with:

role = DOCTOR

The model validates this through clean().

Therefore:

User(role=DOCTOR)
        ↓
      Doctor
        ✅

while:

User(role=PATIENT)
        ↓
      Doctor
        ❌

This keeps the domain model consistent with the existing Accounts architecture.

6. Appointment Model

The core Day 7 feature was the Appointment model.

Structure
Appointment
├── id
├── patient
├── doctor
├── appointment_type
├── scheduled_at
├── status
├── reason
├── notes
├── created_at
└── updated_at

The model inherits from:

BaseModel
├── UUIDMixin
├── TimeStampedMixin
└── SoftDeleteMixin
7. Patient Relationship

Appointments are directly connected to the Patient domain:

Patient
   │
   └── appointments
          │
          ├── Appointment
          ├── Appointment
          └── Appointment

The relationship uses:

related_name="appointments"

Patient appointments can therefore be accessed through:

patient.appointments
8. Doctor Relationship

Appointments are also connected directly to Doctor:

Doctor
   │
   └── appointments
          │
          ├── Appointment
          ├── Appointment
          └── Appointment

The Doctor relationship uses:

on_delete=models.PROTECT

This prevents deleting a Doctor from automatically destroying appointment history.

9. Appointment Types

The following appointment types were implemented:

CONSULTATION
FOLLOW_UP
CHECKUP
EMERGENCY
OTHER

This provides enough flexibility for the initial scheduling system without prematurely introducing unnecessary complexity.

10. Appointment Status

The following statuses were implemented:

SCHEDULED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW

The initial default is:

SCHEDULED

The API prevents patients from directly changing the appointment status.

Status transitions can later be handled through dedicated workflows.

11. Appointment Validation

Two domain-level validations were implemented.

Future appointment validation

Appointments cannot be created in the past:

scheduled_at <= current time
        ↓
      REJECT
Patient/Doctor validation

A patient cannot create an appointment with themselves.

Patient User
     │
     └── Doctor Profile
            ↓
          REJECT

These validations are handled at the model level.

12. Appointment API

The following endpoints were implemented:

/api/v1/appointments/
Collection
GET   /api/v1/appointments/
POST  /api/v1/appointments/
Individual appointment
GET     /api/v1/appointments/<uuid>/
PATCH   /api/v1/appointments/<uuid>/
DELETE  /api/v1/appointments/<uuid>/

The routes were registered through:

api/v1/urls.py

using:

path(
    "appointments/",
    include("apps.appointments.api.urls"),
)
13. Server-Side Patient Assignment

One of the most important security decisions from Day 7 was preventing the client from selecting the Patient.

The request flow is:

POST /api/v1/appointments/
          ↓
authenticated User
          ↓
get_patient_by_user()
          ↓
Patient
          ↓
Appointment.patient

The serializer therefore exposes:

patient = read_only

The client can select:

doctor
appointment_type
scheduled_at
reason
notes

but cannot determine which patient owns the appointment.

14. Patient Isolation

The Appointment API follows the same isolation principle established in Health Records.

User A
   ↓
Patient A
   ↓
Appointments A only

and:

User B
   ↓
Patient B
   ↓
Appointments B only

A patient cannot:

View another patient's appointments.
Retrieve another patient's appointment by UUID.
Modify another patient's appointment.
Delete another patient's appointment.

The database query itself is scoped to the authenticated patient's profile.

15. API Security Tests

The Appointment API test suite validates:

Unauthenticated users cannot access appointments.
Authenticated users can list their appointments.
Patients only see their own appointments.
Cross-patient appointments are hidden.
Patients can create appointments.
Client-supplied patient IDs are ignored.
Patients can retrieve their own appointments.
Patients cannot retrieve another patient's appointment.
Patients can update their own appointment.
Patients cannot update another patient's appointment.
Patients can delete their own appointment.
Patients cannot delete another patient's appointment.
Patients cannot directly change appointment status.
16. Testing

Doctor model tests were added covering:

Doctor creation.
UUID generation.
Doctor/User relationship.
Reverse doctor_profile relationship.
DOCTOR role validation.
Valid Doctor role.
String representation.
License number uniqueness.

Appointment model tests covered:

Appointment creation.
UUID generation.
Patient relationship.
Doctor relationship.
Default appointment type.
Default status.
Patient/Doctor self-booking prevention.
String representation.
Doctor protection.
Past appointment prevention.

Appointment API tests covered authentication, CRUD, patient isolation, server-side ownership, and status protection.

The complete Django test suite was executed successfully.

17. Issues Encountered
Issue 1 — Doctor module was only a scaffold

The existing:

apps/doctors/

contained no actual Doctor model.

The module was therefore implemented as a domain profile around accounts.User.

Issue 2 — Test discovery conflict

The Doctor app originally contained:

apps/doctors/tests.py

After introducing:

apps/doctors/tests/

Python produced:

ImportError:
'tests' module incorrectly imported

The old tests.py scaffold was removed, following the same modular testing architecture used by Records.

Issue 3 — Appointment ownership

The initial API design needed to ensure that a client could not submit another patient's ID.

The solution was:

patient → read_only

and server-side assignment using:

get_patient_by_user(request.user)
Issue 4 — Appointment status manipulation

Patients should not be able to mark their own appointment as:

COMPLETED
CANCELLED
NO_SHOW

through a normal appointment update.

The status field was therefore made read-only in the patient API.

18. Validation

The following validation commands were completed:

python manage.py makemigrations appointments
python manage.py migrate
python manage.py check

Result:

System check identified no issues (0 silenced).

The complete test suite also passed.

19. Final HealthOS Architecture After Day 7
                              HealthOS
                                  │
                                  ▼
                             Patient Core
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       Emergency Contacts   Clinical Profile     Health Records
                                  │
                           ┌──────┴──────┐
                           ▼             ▼
                       Allergies      Conditions

                                  │
                                  ▼
                              Doctors
                                  │
                                  │
                                  ▼
                            Appointments
                           ┌──────┴──────┐
                           ▼             ▼
                        Patient        Doctor
20. Day 7 Definition of Done
Requirement	Status
Doctor app foundation	✅
Doctor/User relationship	✅
Doctor role validation	✅
Doctor model	✅
Doctor tests	✅
Appointment model	✅
BaseModel inheritance	✅
UUID	✅
Timestamps	✅
Soft deletion	✅
Patient relationship	✅
Doctor relationship	✅
Appointment types	✅
Appointment statuses	✅
Future appointment validation	✅
Patient self-booking prevention	✅
Appointment serializer	✅
Appointment API views	✅
Appointment URLs	✅
Global API registration	✅
Authentication	✅
Patient isolation	✅
Server-side patient assignment	✅
Status protection	✅
Model tests	✅
API tests	✅
Full test suite	✅
Django check	✅
Migration	✅
Git commit	✅
Day 7 Status: COMPLETE
Progress
Day 1    Foundation                  ✅
Day 2    Core architecture           ✅
Day 3    Patient foundation          ✅
Day 4    Emergency contacts          ✅
Day 5    Clinical profile            ✅
Day 6    Health records              ✅
Day 7    Appointments                ✅
Current clinical domain
Patient
   │
   ├── Emergency Contacts
   │
   ├── Clinical Profile
   │      ├── Allergies
   │      └── Conditions
   │
   ├── Health Records
   │
   └── Appointments
          │
          └── Doctor

Day 7 establishes the first major operational workflow in HealthOS: connecting a patient to a healthcare provider through a secure appointment system.