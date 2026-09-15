# 06: Authorization is enforced on every endpoint

**What to build:** A centralized authorization layer ensures every tenant-scoped endpoint verifies that the requesting user is a member of the target organization with sufficient role. Cross-tenant access returns 404 (not 403) to avoid leaking resource existence. This ticket closes Phase 1.

**Blocked by:** 03, 04, 05 — Organization CRUD, Invitations, Project CRUD

**Status:** ready-for-agent

**Assignee:** backend-core + security

- [ ] Backend: `AuthorizationService` that resolves `SecurityContext → userId → membership(orgId) → role`
- [ ] Backend: Annotation or method-level check `@RequireRole({OWNER, ADMIN})` for protected endpoints
- [ ] Backend: Every tenant-scoped endpoint verifies org membership before operating
- [ ] Backend: `OrganizationMemberRepository` with efficient membership lookup by user+org
- [ ] Backend: `Feedback` entity includes `organizationId` denormalized (defense in depth)
- [ ] Backend: Cross-tenant test suite — for every sensitive endpoint, attempt access with a user from a different org and assert 404
- [ ] Backend: Role escalation tests — MEMBER cannot perform ADMIN/OWNER actions
- [ ] Frontend: Handle 404 gracefully when accessing unauthorized resources
- [ ] E2E (Playwright): Complete flow — register → login → create org → create project → verify isolation
- [ ] E2E: Verify user A cannot see user B's organizations or projects
