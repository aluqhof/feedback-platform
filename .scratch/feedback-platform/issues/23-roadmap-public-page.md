# 23: Public roadmap page

**What to build:** A publicly accessible page per project that displays published issues with their status, vote counts, and descriptions. Visitors can vote on issues without authentication.

**Blocked by:** 22 — Slack integration for critical feedback

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `V8__roadmap.sql` migration — add `is_public` and `votes` to issues
- [ ] Backend: `GET /api/public/v1/projects/{publicKey}/roadmap` — list public issues (no auth)
- [ ] Backend: `POST /api/public/v1/projects/{publicKey}/issues/{id}/vote` — vote with IP-based dedup
- [ ] Backend: Issue statuses for roadmap: UNDER_CONSIDERATION, PLANNED, IN_DEVELOPMENT, RELEASED
- [ ] Frontend: Public roadmap page — kanban-style columns by status
- [ ] Frontend: Issue cards with title, description, vote count, vote button
- [ ] Frontend: Responsive public page (no login required)
- [ ] Frontend: Shareable URL per project roadmap
- [ ] Tests: backend tests for public roadmap, voting dedup, cross-project isolation
- [ ] Tests: frontend tests for roadmap UI components
