# 24: Automatic fingerprinting and duplicate suggestion

**What to build:** The system automatically generates fingerprints for incoming feedback based on title/description similarity and technical context. When similar feedback is detected, it suggests linking to an existing issue.

**Blocked by:** 17 — Link and unlink feedback to issues

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: Fingerprint generation from feedback (normalized title + error signature + URL path)
- [ ] Backend: Redis dedup cache (`fp:{fingerprint}` → issueId) with 24h TTL
- [ ] Backend: `GET /feedback/{id}/suggestions` — suggest similar feedback and related issues
- [ ] Backend: Background similarity scoring (Jaccard or cosine on tokenized text)
- [ ] Frontend: "Suggested duplicates" panel on feedback detail
- [ ] Frontend: "Link to existing issue" suggestion with confidence score
- [ ] Frontend: One-click link to suggested issue
- [ ] Tests: backend tests for fingerprint generation, similarity scoring, cache TTL
- [ ] Tests: end-to-end — submit 3 similar feedbacks → verify suggestions
