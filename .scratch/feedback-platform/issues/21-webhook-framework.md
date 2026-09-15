# 21: Outgoing webhook framework

**What to build:** A generic webhook framework that allows registering webhook URLs per project, signing payloads with HMAC, and retrying failed deliveries with exponential backoff. Foundation for Phase 7.

**Blocked by:** 17 — Link and unlink feedback to issues

**Status:** ready-for-agent

**Assignee:** backend-core

- [ ] Backend: `webhooks` table (project_id, url, secret, events[], active, created_at)
- [ ] Backend: `WebhookDelivery` table (webhook_id, payload, status, response_status, attempts, next_retry_at)
- [ ] Backend: `WebhookService` with HMAC-SHA256 signature (`X-Webhook-Signature` header)
- [ ] Backend: Retry logic with exponential backoff (max 5 attempts)
- [ ] Backend: Webhook events: `feedback.created`, `feedback.critical`, `issue.created`
- [ ] Backend: `POST /projects/{projectId}/webhooks` — register webhook (OWNER/ADMIN)
- [ ] Backend: `GET /projects/{projectId}/webhooks` — list webhooks
- [ ] Backend: `DELETE /webhooks/{id}` — delete webhook
- [ ] Tests: backend tests for HMAC signature, retry logic, delivery tracking
