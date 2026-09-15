# 20: SDK screenshot capture and ingestion

**What to build:** The SDK captures a screenshot of the current viewport using html2canvas (or similar) and sends the complete feedback payload (JSON + screenshot) to the public ingestion endpoint. Includes the widget UI for triggering feedback submission.

**Blocked by:** 19 — SDK context capture and event buffer

**Status:** ready-for-agent

**Assignee:** frontend-dev

- [ ] SDK `sendFeedback({ type, title, description })` method
- [ ] SDK captures screenshot via html2canvas or dom-to-image (with cross-origin fallback)
- [ ] SDK sends multipart request: JSON metadata + optional screenshot file
- [ ] SDK handles rate limit responses (429) with user-friendly message
- [ ] SDK provides success/error callbacks
- [ ] Widget UI: floating button → form modal → type selector, title, description, screenshot preview
- [ ] Widget UI: success/error toast notifications
- [ ] Widget UI: configurable position and theme
- [ ] Tests: unit tests for screenshot capture, multipart construction, error handling
- [ ] E2E: Demo page submits real feedback with screenshot → verify in dashboard inbox
