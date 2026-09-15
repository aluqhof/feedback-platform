# 15: Comments and audit log UI

**What to build:** Team members can add comments to feedback items, view the comment thread, and consult the audit log for management actions. This closes Phase 4.

**Blocked by:** 14 — Tags and member assignment on feedback

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `POST /feedback/{id}/comments` — add comment to feedback
- [ ] Backend: `GET /feedback/{id}/comments` — list comments chronologically
- [ ] Backend: `DELETE /comments/{id}` — soft delete own comment (or ADMIN/OWNER can delete any)
- [ ] Backend: `GET /feedback/{id}/audit` — audit log entries for this feedback
- [ ] Frontend: Comment thread on feedback detail — add comment, display list, timestamps, author
- [ ] Frontend: Comment deletion (with confirmation)
- [ ] Frontend: Audit log panel/tab on feedback detail — chronological actions with before/after diff
- [ ] Frontend: Real-time comment updates via React Query invalidation
- [ ] Tests: backend tests for comment CRUD, deletion permissions
- [ ] Tests: backend audit log tests — verify every action is recorded
- [ ] E2E (Playwright): Add comment → verify visible → delete → verify gone
