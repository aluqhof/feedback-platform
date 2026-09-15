# 01: User can register and log in

**What to build:** A complete end-to-end authentication flow. A visitor can register with email and password, then log in and receive HttpOnly cookies with a JWT access token and an opaque refresh token. Rate limiting protects the login endpoint from brute force.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `V1__users_and_refresh_tokens.sql` migration (users, refresh_tokens tables)
- [ ] Backend: `User` JPA entity with BCrypt password hashing (cost 12)
- [ ] Backend: `POST /auth/register` — validate email uniqueness, hash password, create user, set cookies
- [ ] Backend: `POST /auth/login` — validate credentials, issue JWT (15 min, HS256) + opaque refresh token, set HttpOnly Secure SameSite=Lax cookies
- [ ] Backend: Rate limiting on login via Redis (`rl:auth:{ip}:{email}`, 15 min window)
- [ ] Backend: `ApiException` codes for auth errors (INVALID_CREDENTIALS, EMAIL_EXISTS, RATE_LIMITED)
- [ ] Frontend: Register page with form (email, password, confirm password), zod validation, error display
- [ ] Frontend: Login page with form (email, password), zod validation, error display
- [ ] Frontend: On successful auth, redirect to org selector (or dashboard placeholder if no orgs)
- [ ] Frontend: `features/auth/api.ts` with TanStack React Query mutations for register/login
- [ ] Tests: backend integration tests for register/login (200, 400, 409, 429); frontend component tests for forms
