# 12: Display technical context and event timeline in detail view

**What to build:** The feedback detail page shows all captured technical context (URL, browser, viewport, app version, errors), a timeline of events that preceded the feedback, and the screenshot. This closes Phase 3.

**Blocked by:** 11 — Screenshot upload via multipart ingestion

**Status:** ready-for-agent

**Assignee:** frontend-dev + backend-core

- [ ] Backend: `GET /api/v1/feedback/{id}` includes `metadata`, `technicalContext`, `events[]`, `attachments[]` with presigned URLs
- [ ] Frontend: Feedback detail page expanded with context sections
- [ ] Frontend: Technical context card — browser, viewport, URL, app version, errors
- [ ] Frontend: Event timeline component — chronological list of PAGE_VIEW, CLICK, NETWORK_ERROR, CONSOLE_ERROR, CUSTOM events
- [ ] Frontend: Screenshot display with lightbox/zoom
- [ ] Frontend: Responsive layout for detail view
- [ ] Tests: frontend component tests for timeline and context display
- [ ] E2E (Playwright): Submit feedback with screenshot and context → verify all data visible in detail
