# 02: User can view and manage their session

**What to build:** An authenticated user can view their profile, refresh an expiring session transparently, and log out securely. Refresh token rotation with reuse detection revokes the entire token family if a used refresh token is presented again.

**Blocked by:** 01 — User can register and log in

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `GET /me` — returns current user profile from JWT cookie
- [ ] Backend: `POST /auth/refresh` — validates refresh token hash, issues new access + refresh pair, rotates refresh token, stores hash in DB
- [ ] Backend: Refresh token reuse detection — if a used refresh token is presented, revoke the entire family (all tokens for that user/session chain)
- [ ] Backend: `POST /auth/logout` — revokes current refresh token, clears cookies
- [ ] Frontend: Auth context/provider with React Query that checks session on app load (`GET /me`)
- [ ] Frontend: Automatic silent refresh before JWT expiry (via React Query `staleTime` + refetch)
- [ ] Frontend: Logout button that calls `POST /auth/logout` and clears client state
- [ ] Frontend: Protected route middleware — redirect unauthenticated users to /login
- [ ] Tests: backend integration tests for refresh rotation, reuse detection (expect 401 + family revocation), logout
- [ ] Tests: frontend tests for auth context, logout flow
