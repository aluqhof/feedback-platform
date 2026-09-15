# 03: User can create and switch organizations

**What to build:** An authenticated user can create an organization, view their organizations, and switch between them. Each organization is a tenant with strict data isolation. The user who creates the org becomes OWNER.

**Blocked by:** 02 — User can view and manage their session

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `V1__organizations_and_members.sql` migration (organizations, organization_members tables)
- [ ] Backend: `Organization` and `OrganizationMember` JPA entities with roles enum (OWNER, ADMIN, MEMBER)
- [ ] Backend: `POST /organizations` — create org, add creator as OWNER
- [ ] Backend: `GET /organizations` — list orgs where user is a member
- [ ] Backend: `GET /organizations/{id}` — get org details (verify membership)
- [ ] Backend: `PATCH /organizations/{id}` — update org name (OWNER/ADMIN only)
- [ ] Backend: `DELETE /organizations/{id}` — delete org (OWNER only, with safeguards)
- [ ] Frontend: Organization selector in navigation (dropdown or sidebar)
- [ ] Frontend: "Create organization" modal/page with name input
- [ ] Frontend: Organization context in React Query — invalidate queries on org switch
- [ ] Tests: backend cross-tenant tests — accessing another user's org returns 404
- [ ] Tests: backend role-based access tests — MEMBER cannot delete org
