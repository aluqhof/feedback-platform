# 09: Feedback detail and state management

**What to build:** Team members can open a feedback detail view and change its status and priority. Changes are reflected immediately in the inbox. This closes Phase 2.

**Blocked by:** 08 — Feedback inbox with pagination and filters

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `GET /api/v1/feedback/{id}` — full feedback details with project verification
- [ ] Backend: `PATCH /api/v1/feedback/{id}` — update status and/or priority with validation
- [ ] Backend: Status transition validation (e.g., CLOSED cannot go back to NEW without reopening logic)
- [ ] Frontend: Feedback detail page/route (`/{orgSlug}/{projectSlug}/feedback/{id}`)
- [ ] Frontend: Status badge with color coding and status change dropdown
- [ ] Frontend: Priority selector with visual indicators
- [ ] Frontend: Optimistic updates in React Query for instant UI feedback
- [ ] Frontend: Error handling for invalid transitions
- [ ] Tests: backend integration tests for detail fetch, status transitions, invalid transitions
- [ ] Tests: backend cross-tenant tests — cannot access feedback from another org
- [ ] E2E (Playwright): Submit feedback via ingestion → view in inbox → open detail → change status → verify in inbox
