# HealthOS - Development Rules

## Purpose

These rules ensure HealthOS remains secure, scalable, maintainable, and production-ready.

---

# What to Use

## Architecture
- Modular architecture.
- Feature-based modules.
- Service-oriented design.
- Clear separation of concerns.
- REST APIs with versioning (`/api/v1/`).

## Backend
- Python
- Django
- Django REST Framework
- Celery for background jobs
- PostgreSQL as the primary database
- Redis for caching and queues

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- TanStack Query
- Zustand for client state

## Coding Standards
- Type hints where applicable.
- Meaningful variable and function names.
- Small, reusable functions.
- Reusable components.
- SOLID principles.
- DRY (Don't Repeat Yourself).
- KISS (Keep It Simple).

## Security
- JWT authentication.
- Role-Based Access Control (RBAC).
- Multi-factor authentication.
- HTTPS everywhere.
- Encrypt sensitive data at rest and in transit.
- Validate and sanitize all user input.
- Record all critical actions in audit logs.

## Database
- UUID primary keys.
- Proper indexing.
- Foreign key constraints.
- Database migrations only (never edit production schema manually).
- Soft deletes where business logic requires them.

## AI
- AI assists; it never makes final clinical decisions.
- Validate AI-extracted medical data before permanent storage when confidence is low.
- Log AI confidence scores and model versions.
- Keep AI services isolated from core business logic.

## Documentation
- Document every API.
- Keep architecture documents updated.
- Write README files for each major module.

---

# What to Avoid

## Architecture
- Monolithic business logic.
- Circular dependencies.
- Tight coupling between modules.
- Hardcoded values and secrets.

## Backend
- Business logic inside views.
- Raw SQL unless absolutely necessary.
- Long synchronous tasks in request handlers.
- Duplicate code.

## Frontend
- Large, stateful components.
- Inline business logic.
- Excessive prop drilling.
- Unused dependencies.

## Security
- Storing passwords in plain text.
- Logging sensitive personal or medical information.
- Exposing internal APIs publicly.
- Disabling authentication or authorization checks.
- Committing secrets or API keys to version control.

## Database
- Using `SELECT *` in production queries.
- Missing indexes on frequently queried fields.
- Deleting critical medical records permanently without policy.
- Breaking backward compatibility without migrations.

## AI
- Allowing AI to overwrite verified medical records automatically.
- Using AI output without validation for critical workflows.
- Making diagnoses or treatment decisions solely from AI.

## General
- Premature optimization.
- Copy-paste programming.
- Ignoring code reviews.
- Skipping tests.
- Ignoring linting or formatting.
- Deploying directly to production without CI/CD.

---

# Definition of Done

A feature is complete only if:
- Requirements are implemented.
- Tests pass.
- Linting passes.
- Documentation is updated.
- Security checks are complete.
- Performance is acceptable.
- APIs are documented.
- Code has been reviewed.
- Feature is production-ready.
