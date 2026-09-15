# 05: User can create and manage projects

**What to build:** Within an organization, users can create projects that represent the SaaS products receiving feedback. Each project gets an auto-generated `publicKey` for public ingestion and configurable `allowedOrigins` for CORS.

**Blocked by:** 03 — User can create and switch organizations

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `V1__projects.sql` migration (projects table with public_key, environment, allowed_origins)
- [ ] Backend: `Project` JPA entity with auto-generated `publicKey` (URL-safe random string)
- [ ] Backend: `POST /organizations/{id}/projects` — create project, generate publicKey (OWNER/ADMIN only)
- [ ] Backend: `GET /organizations/{id}/projects` — list projects for org
- [ ] Backend: `GET /projects/{id}` — get project details (verify org membership)
- [ ] Backend: `PATCH /projects/{id}` — update name, environment, allowedOrigins (OWNER/ADMIN only)
- [ ] Backend: `DELETE /projects/{id}` — delete project (OWNER only)
- [ ] Frontend: Project list page within org context
- [ ] Frontend: "Create project" form with name, environment selector, allowed origins textarea
- [ ] Frontend: Project settings page with publicKey display (read-only) and edit form
- [ ] Frontend: Project context in URL — `/{orgSlug}/{projectSlug}/...`
- [ ] Tests: backend cross-tenant tests — cannot access project from another org
- [ ] Tests: backend tests for publicKey uniqueness, allowedOrigins validation
