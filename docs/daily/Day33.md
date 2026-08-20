Day 33 Report — Audit API + Permissions

Status: COMPLETE

Objective

Expose the new general AuditLog system through a secure, read-only API with authorization, filtering, and pagination.

Completed
Component	Status
AuditLogSerializer	Complete
Read-only list API	Complete
Read-only detail API	Complete
Authentication	Complete
Role-based authorization	Complete
Audit filtering	Complete
Audit pagination	Complete
API URL registration	Complete
API tests	Complete
Permission tests	Complete
Full regression	295/295 passed
API architecture
/api/v1/audit/
        │
        ▼
AuditLogListView
        │
        ├── Authentication
        ├── Authorization
        ├── Filtering
        └── Pagination
              │
              ▼
        AuditLogSerializer
              │
              ▼
          AuditLog

Detail endpoint:

GET /api/v1/audit/<id>/
Authorization

Current system-wide audit access:

ADMIN       → ALLOW
HOSPITAL    → ALLOW
SUPERUSER   → ALLOW


DOCTOR      → DENY
PATIENT     → DENY
ANONYMOUS   → DENY

Implemented through the dedicated:

CanViewAuditLogs

permission rather than scattering role checks across views.

Filtering

Supported:

?action=CREATED
?target_type=Appointment
?target_id=101
?actor=<uuid>

Filters can be combined.

Pagination

Pagination was deliberately scoped to the Audit API only.

This was important because enabling DRF pagination globally initially changed existing API response contracts and caused regression failures.

Final architecture:

Audit API
    └── PageNumberPagination ✓


Existing APIs
    └── Existing response behavior preserved ✓
Testing

Focused Audit API tests:

11 tests
11 passed

Permission tests:

Passed

Full backend regression:

295 tests
295 passed
0 failures
0 errors

The notification retry/error output seen during the suite was part of an existing test scenario and did not produce a failing test.

Existing clinical audit

The existing:

ClinicalAuditEvent
ClinicalAuditService
Clinical Audit API

remains separate and was not replaced or merged with the general AuditLog system.

Git

Day 33 changes staged:

api/v1/urls.py
apps/common/api/__init__.py
apps/common/api/permissions.py
apps/common/api/serializers.py
apps/common/api/urls.py
apps/common/api/views.py
apps/common/tests/test_audit_api.py
apps/common/tests/test_audit_permissions.py

Commit:

feat: add audit log read API and permissions
Architecture after Day 33
                    Domain Event
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      Notification Handler     Audit Handler
              │                     │
              ▼                     ▼
        Notification             AuditLog
                                      │
                                      ▼
                                  Audit API
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                    Authorization  Filtering   Pagination
Overall HealthOS backend position

Day 32: Audit foundation
Day 33: Audit API + security boundary
Day 34: Backend hardening / final API validation
Day 35: Begin frontend preparation

The backend now has a substantially stronger foundation for moving toward the frontend while continuing hardening in parallel.