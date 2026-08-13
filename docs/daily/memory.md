# HealthOS – Project Memory

## Purpose

This document stores long-term project context so development remains consistent across sessions. It should be updated whenever major architectural or product decisions are made.

---

# Project Overview

**Project Name:** HealthOS

**Vision:**
Build a secure, AI-powered healthcare platform that creates a lifelong digital health record for every individual and enables seamless, consent-based healthcare across providers.

---

# Core Principles

- Patient owns their health data.
- Privacy and security come first.
- AI assists healthcare professionals; it never replaces clinical judgment.
- Modular, scalable architecture.
- Production-ready engineering practices.
- Standards-based interoperability.

---

# Product Goals

- Lifelong health timeline
- Universal Health ID (UHID)
- Emergency medical access
- AI medical summaries
- Hospital, clinic, lab, and pharmacy integration
- Enterprise scalability
- Digital Health Twin (long-term vision)

---

# Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI

## Backend
- Python
- Django
- Django REST Framework
- Celery

## Data
- PostgreSQL
- Redis
- Elasticsearch
- Object Storage (S3/MinIO)

## Infrastructure
- Docker
- Kubernetes
- Nginx
- GitHub Actions
- Prometheus
- Grafana

---

# Architecture Decisions

- Feature-based modular architecture
- REST API (versioned)
- UUID primary keys
- RBAC authorization
- JWT authentication
- Service-oriented modules
- AI isolated from business logic
- Consent-driven data access

---

# Development Workflow

For every feature:

1. Understand requirements.
2. Design database schema.
3. Design APIs.
4. Implement backend.
5. Build frontend.
6. Integrate AI (if needed).
7. Write tests.
8. Review security.
9. Update documentation.
10. Deploy.

---

# Coding Rules

- Keep functions small and reusable.
- Avoid duplicate code.
- Use meaningful names.
- Follow SOLID and DRY principles.
- Document public APIs.
- Never commit secrets.
- Never bypass authentication or authorization.

---

# Completed Decisions

- HealthOS is the product name.
- Modular architecture is the default.
- AI provides assistive functionality only.
- PostgreSQL is the primary database.
- Django + DRF is the backend framework.
- Next.js + React is the frontend framework.

---

# Open Decisions

Track unresolved topics here.

Example:
- National identity integration approach.
- Offline synchronization strategy.
- Biometric verification implementation.
- Regulatory compliance roadmap.

---

# Change Log

Record significant decisions.

Example:
- YYYY-MM-DD: Added emergency QR access.
- YYYY-MM-DD: Adopted modular architecture.
- YYYY-MM-DD: Switched to Next.js frontend.

---

# Notes

- Keep this document concise.
- Do not store temporary tasks here.
- Update only for long-term project decisions.
- Use this file as the single source of project memory.
