# 19: SDK context capture and event buffer

**What to build:** The SDK automatically captures technical context (URL, browser, viewport, app version, errors) and buffers user events (page views, clicks, network errors, console errors) before sending feedback.

**Blocked by:** 18 — SDK scaffold and initialization

**Status:** ready-for-agent

**Assignee:** frontend-dev

- [ ] SDK auto-captures: URL, userAgent, viewport (width/height), appVersion, language, platform
- [ ] SDK buffers events: PAGE_VIEW, CLICK, NETWORK_ERROR (via fetch/XHR monkey-patch), CONSOLE_ERROR (via console.error override), CUSTOM
- [ ] SDK stores last N events in a ring buffer (configurable, default 50)
- [ ] SDK captures recent errors from `window.onerror` and `window.onunhandledrejection`
- [ ] SDK `trackEvent(type, data)` for custom events
- [ ] SDK provides `getContext()` and `getEvents()` for internal use
- [ ] Tests: unit tests for context capture accuracy, event buffer limits, error capture
- [ ] Demo: HTML page showing captured context and events in console
