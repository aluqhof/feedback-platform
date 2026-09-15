# 16: Issues schema and CRUD

**What to build:** Team members can create Issues (consolidated problems) and view them. A feedback item can be linked to an issue. Issues have a lifecycle status. Foundation for Phase 5.

**Blocked by:** 15 — Comments and audit log UI

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `V5__issues.sql` migration — issues table (title, description, status, priority, organization_id)
- [ ] Backend: `V5__feedback_issue_link.sql` migration — add `issue_id` to feedback (nullable, with FK)
- [ ] Backend: `Issue` JPA entity with status lifecycle (NEW → UNDER_INVESTIGATION → IN_PROGRESS → RESOLVED → CLOSED)
- [ ] Backend: `POST /projects/{projectId}/issues` — create issue
- [ ] Backend: `GET /projects/{projectId}/issues` — list issues with feedback count
- [ ] Backend: `GET /issues/{id}` — get issue with linked feedback list
- [ ] Backend: `PATCH /issues/{id}` — update title, description, status, priority
- [ ] Backend: `DELETE /issues/{id}` — delete issue (unlink feedback first)
- [ ] Frontend: Issues list page with status filters and feedback count
- [ ] Frontend: Issue detail page with linked feedback sidebar
- [ ] Frontend: Create issue modal/form
- [ ] Frontend: Issue status badge with lifecycle visualization
- [ ] Tests: backend tests for issue CRUD, status transitions, cross-tenant protection
