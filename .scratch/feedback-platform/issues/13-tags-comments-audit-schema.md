# 13: Tags, comments, and audit log schema

**What to build:** Database schema for team collaboration: tags per project, feedback-tag relationships, comments on feedback, and an audit log tracking every management action. Foundation for Phase 4.

**Blocked by:** 12 — Display technical context and event timeline

**Status:** ready-for-agent

**Assignee:** backend-core

- [ ] Backend: `V4__tags.sql` migration — tags (project-scoped, name, color), feedback_tags (N:M)
- [ ] Backend: `V4__comments.sql` migration — comments table with polymorphic FK (feedback_id XOR issue_id)
- [ ] Backend: `V4__audit_logs.sql` migration — audit_logs (action, entity_type, entity_id, user_id, data JSONB with before/after)
- [ ] Backend: `Tag`, `FeedbackTag`, `Comment`, `AuditLog` JPA entities
- [ ] Backend: `AuditLogService` with Spring events — publishes audit events consumed by audit module
- [ ] Backend: Initial audit events: status change, priority change, assignment change
- [ ] Tests: backend integration tests for schema migrations
- [ ] Tests: backend tests for AuditLog event consumption
