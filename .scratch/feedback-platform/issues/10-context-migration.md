# 10: Feedback context schema — metadata, events, attachments

**What to build:** The database schema expands to store rich technical context: metadata JSONB, technical context fields, a timeline of events before the feedback, and attachment metadata. This is the foundation for Phase 3.

**Blocked by:** 09 — Feedback detail and state management

**Status:** ready-for-agent

**Assignee:** backend-core

- [ ] Backend: `V3__context.sql` migration — add `metadata` (JSONB), `technical_context` (JSONB) to feedback
- [ ] Backend: `V3__feedback_events.sql` migration — feedback_events table (type, timestamp, data JSONB)
- [ ] Backend: `V3__attachments.sql` migration — attachments table (filename, content_type, size, storage_key, kind)
- [ ] Backend: `FeedbackEvent` JPA entity with enum: PAGE_VIEW, CLICK, NETWORK_ERROR, CONSOLE_ERROR, CUSTOM
- [ ] Backend: `Attachment` JPA entity with enum kind: SCREENSHOT, FILE
- [ ] Backend: `Feedback` entity updated with `@OneToMany` relationships to events and attachments
- [ ] Backend: Update `POST /api/public/v1/feedback` to accept optional `metadata`, `technicalContext`, `events[]`
- [ ] Tests: backend integration tests for ingestion with context data
- [ ] Tests: backend repository tests for event and attachment queries
