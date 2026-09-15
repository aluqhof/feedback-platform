# 07: Public feedback ingestion endpoint

**What to build:** Anyone can submit feedback to a project using its `publicKey` via a public API endpoint. The backend resolves the project from the key (with Redis caching), validates the payload, enforces rate limits, and stores the feedback. No authentication required.

**Blocked by:** 05 — User can create and manage projects

**Status:** ready-for-agent

**Assignee:** backend-core

- [ ] Backend: `V2__feedback.sql` migration (feedback table with type, status, priority enums, organization_id denormalized)
- [ ] Backend: `Feedback` JPA entity with enums: type (BUG, FEATURE, GENERAL), status (NEW, IN_PROGRESS, RESOLVED, CLOSED), priority (LOW, MEDIUM, HIGH, CRITICAL)
- [ ] Backend: `POST /api/public/v1/feedback` — accept JSON feedback payload, resolve project by publicKey
- [ ] Backend: Redis cache for `project:pk:{publicKey}` → JSON (id, orgId, origins) with 5 min TTL
- [ ] Backend: Rate limiting via Redis (`rl:ingest:{publicKey}:{ipHash}`) — 20 req/min, 100 req/h
- [ ] Backend: CORS validation against `project.allowedOrigins`
- [ ] Backend: Payload validation — JSON ≤ 100 KB, ≤ 50 events
- [ ] Backend: `FeedbackIngestionService` with dedup placeholder (fingerprint field ready)
- [ ] Tests: backend integration tests for ingestion (200, 400, 429, invalid publicKey)
- [ ] Tests: backend rate limit tests — exceed 20/min and expect 429
- [ ] Tests: backend CORS tests — request from unauthorized origin rejected
- [ ] Manual: verify ingestion with curl/HTTP client
