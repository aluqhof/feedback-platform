# 25: AI interface with no-op default

**What to build:** An abstraction layer for AI-powered features (summarization, categorization, priority suggestion) with a no-op default implementation. The system is ready for plugging in a real AI provider later without architectural changes.

**Blocked by:** 24 — Automatic fingerprinting and duplicate suggestion

**Status:** ready-for-agent

**Assignee:** backend-core

- [ ] Backend: `AiService` interface with methods: `summarize(text)`, `categorize(text)`, `suggestPriority(feedback)`
- [ ] Backend: `NoOpAiService` implementation (returns empty/null defaults)
- [ ] Backend: `AiProperties` configuration (enabled, provider, apiKey)
- [ ] Backend: Conditional bean registration — use real implementation if configured, else no-op
- [ ] Backend: `FeedbackProcessor` that calls AI service after ingestion (if enabled)
- [ ] Backend: Store AI suggestions in feedback metadata (non-blocking, async)
- [ ] Frontend: Display AI suggestions (category, priority, summary) on feedback detail when available
- [ ] Frontend: "AI suggested" badge with opt-in/opt-out indicator
- [ ] Tests: backend tests for no-op service, conditional wiring, async processing
- [ ] Tests: backend tests for AI service failure handling (graceful degradation)
