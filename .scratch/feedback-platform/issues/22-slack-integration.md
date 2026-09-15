# 22: Slack integration for critical feedback

**What to build:** Team members can connect a Slack webhook URL to a project. When feedback with CRITICAL priority is received, a formatted message is sent to the configured Slack channel.

**Blocked by:** 21 — Outgoing webhook framework

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: Slack-specific webhook payload formatter (rich blocks with feedback title, link to dashboard, context summary)
- [ ] Backend: Trigger Slack webhook on `feedback.critical` event
- [ ] Frontend: Slack integration settings page — webhook URL input, test button, enable/disable toggle
- [ ] Frontend: Test webhook button sends a test message to Slack
- [ ] Frontend: Integration status indicator (last delivery success/failure)
- [ ] Tests: backend tests for Slack payload format, delivery on critical feedback
- [ ] E2E: Configure Slack webhook → submit critical feedback → verify message in Slack
