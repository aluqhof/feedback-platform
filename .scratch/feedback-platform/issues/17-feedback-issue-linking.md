# 17: Link and unlink feedback to issues

**What to build:** Team members can link existing feedback to an issue (consolidating related reports) or unlink them. The issue detail shows all linked feedback. This closes Phase 5.

**Blocked by:** 16 — Issues schema and CRUD

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `POST /feedback/{id}/link` — link feedback to issue (verify same org/project)
- [ ] Backend: `POST /feedback/{id}/unlink` — unlink feedback from issue
- [ ] Backend: `GET /issues/{id}/feedback` — paginated list of linked feedback
- [ ] Backend: Issue feedback count updated automatically
- [ ] Backend: Audit log entries for link/unlink actions
- [ ] Frontend: "Link to issue" action on feedback detail — search/select issue dropdown
- [ ] Frontend: "Create new issue and link" option from feedback detail
- [ ] Frontend: "Unlink" button on linked feedback cards in issue detail
- [ ] Frontend: Feedback cards show linked issue badge in inbox
- [ ] Frontend: Issue selector in feedback filters ("has issue / no issue")
- [ ] Tests: backend tests for link/unlink, cross-tenant protection, count updates
- [ ] E2E (Playwright): Create 2 feedbacks → create issue → link both → verify issue detail → unlink one → verify
