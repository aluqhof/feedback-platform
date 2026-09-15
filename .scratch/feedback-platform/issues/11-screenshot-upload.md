# 11: Screenshot upload via multipart ingestion

**What to build:** The public ingestion endpoint accepts multipart requests (JSON + screenshot file). The backend validates the file (magic bytes, size ≤5MB, png/jpeg/webp), uploads to MinIO via the FileStorageService abstraction, and stores attachment metadata.

**Blocked by:** 10 — Feedback context schema

**Status:** ready-for-agent

**Assignee:** backend-core

- [ ] Backend: `FileStorageService` interface (`put(key, bytes, contentType)`, `getPresignedGet(key, ttl)`, `delete(key)`)
- [ ] Backend: `MinioFileStorageService` implementation using MinIO Java client
- [ ] Backend: File validation — magic bytes check, extension whitelist (png, jpeg, webp), size ≤ 5MB
- [ ] Backend: `POST /api/public/v1/feedback` accepts `multipart/form-data` (JSON part + optional file part)
- [ ] Backend: Generate opaque storage keys (UUID-based, not guessable)
- [ ] Backend: Store attachment metadata in PostgreSQL, binary in MinIO
- [ ] Backend: Include `screenshotUrl` (presigned GET) in feedback detail response
- [ ] Backend: Update Redis cache invalidation on project config changes
- [ ] Tests: backend integration tests for multipart upload, invalid file types, oversized files
- [ ] Tests: backend tests for FileStorageService with Testcontainers MinIO
