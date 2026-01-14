# Cloud SaaS Platform (Cloud-Native SaaS Monorepo)

A production-style starter SaaS platform built with:

- **Frontend:** React (Vite)
- **Backend:** Django + DRF
- **Auth:** JWT (SimpleJWT)
- **Multi-tenancy:** Organizations + Memberships (roles: owner/admin/member)
- **Database:** Postgres (local Docker or Neon in production)
- **Infra:** Docker Compose (local), Kubernetes (coming)
- **CI:** GitHub Actions (CI Gate + backend tests with Postgres + frontend build)

---

## Architecture

- **frontend/** → React SPA (Vite)
- **backend/** → Django REST API
- **infra/compose/** → local docker-compose (db + backend + frontend)
- **infra/k8s/** → Kubernetes manifests (Phase 7+)

Runtime flow:
- React calls Django REST API
- Django uses Postgres
- Tenant context passed via header: **`X-Org-Id`**

---

## Features

### Authentication
- Register: `POST /api/auth/register/`
- Login (JWT): `POST /api/auth/login/`
- Refresh: `POST /api/auth/refresh/`
- Current user: `GET /api/auth/me/`

### Multi-tenant Organizations (SaaS Core)
- List orgs: `GET /api/orgs/`
- Create org: `POST /api/orgs/`
- Current org: `GET /api/orgs/current/` (requires `X-Org-Id` header)

### RBAC (Role-Based Access Control)
Roles:
- `owner`, `admin`, `member`

Enforcement:
- Only `owner/admin` can invite members and create projects

### Tenant-scoped Projects
- List projects: `GET /api/projects/` (requires `X-Org-Id`)
- Create project: `POST /api/projects/` (requires `owner/admin`)

### Invitations (basic)
- Invite member: `POST /api/orgs/invite/` (owner/admin only)
  - If invited user does not exist yet, returns **202** (email sending later)

---

## Local Development (Docker Compose)

### Start everything
From repo root:
```bash
docker compose -f infra/compose/docker-compose.yml up --build
