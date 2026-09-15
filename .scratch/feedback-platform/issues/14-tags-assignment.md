# 14: Tags and member assignment on feedback

**What to build:** Team members can create tags per project, assign/unassign tags to feedback, and assign a responsible team member to a feedback item. Changes are audited.

**Blocked by:** 13 — Tags, comments, and audit log schema

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `POST /projects/{projectId}/tags` — create tag with name and color
- [ ] Backend: `GET /projects/{projectId}/tags` — list tags
- [ ] Backend: `DELETE /projects/{projectId}/tags/{id}` — delete tag (removes from all feedback)
- [ ] Backend: `POST /feedback/{id}/tags` — assign tag to feedback
- [ ] Backend: `DELETE /feedback/{id}/tags/{tagId}` — remove tag from feedback
- [ ] Backend: `PATCH /feedback/{id}/assignee` — assign/unassign responsible member (must be org member)
- [ ] Backend: Audit log entries for tag assignment, removal, and assignee changes
- [ ] Frontend: Tag management UI — create, list, delete tags with color picker
- [ ] Frontend: Tag badges on feedback cards and detail view
- [ ] Frontend: Tag selector (multi-select) on feedback detail
- [ ] Frontend: Assignee dropdown on feedback detail (org members list)
- [ ] Frontend: Visual indicator for assigned feedback in inbox
- [ ] Tests: backend tests for tag CRUD, assignment, cross-tenant protection
- [ ] Tests: backend audit log verification for each action
