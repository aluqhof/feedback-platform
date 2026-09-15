# 18: SDK scaffold and initialization

**What to build:** A new `sdk/` project with its own `AGENTS.md`, build setup, and core initialization API. The SDK can be initialized with a project key and user identity, ready to capture context and send feedback.

**Blocked by:** 17 — Link and unlink feedback to issues

**Status:** ready-for-agent

**Assignee:** frontend-dev (or a future sdk subagent)

- [ ] Create `sdk/` directory with `AGENTS.md`, `package.json`, `tsconfig.json`, build setup (Vite or Rollup)
- [ ] SDK entry point: `Feedback.init({ projectKey, user?, appVersion?, metadata? })`
- [ ] SDK stores config and validates projectKey format
- [ ] SDK `identify(user)` method to update user context
- [ ] SDK `setMetadata(key, value)` for custom metadata
- [ ] SDK exposes TypeScript types
- [ ] SDK builds to UMD + ESM bundles
- [ ] Tests: unit tests for init, identify, setMetadata
- [ ] Demo HTML page that loads the SDK via script tag
