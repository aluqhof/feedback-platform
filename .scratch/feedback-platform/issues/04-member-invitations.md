# 04: User can invite team members

**What to build:** Organization owners and admins can invite new members via email or a shareable link. The invitee accepts via a tokenized link and joins the organization with MEMBER role. In development, invitation links are logged to the console instead of sent via email.

**Blocked by:** 03 — User can create and switch organizations

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `V1__invitations.sql` migration (invitations table with hashed token, expiry, accepted_at)
- [ ] Backend: `Invitation` JPA entity with token hashing (SHA-256) and 7-day expiry
- [ ] Backend: `POST /organizations/{id}/invitations` — create invitation, generate token, log link in dev
- [ ] Backend: `POST /invitations/{token}/accept` — validate token, add user to org as MEMBER
- [ ] Backend: `GET /organizations/{id}/invitations` — list pending invites (OWNER/ADMIN only)
- [ ] Backend: `DELETE /organizations/{id}/invitations/{id}` — revoke pending invite
- [ ] Frontend: "Invite members" page with email input and generated link display
- [ ] Frontend: Pending invitations list with revoke action
- [ ] Frontend: Accept invitation page (`/invitations/{token}`) that calls accept endpoint
- [ ] Tests: backend tests for token expiry (expect error after 7 days), double accept, revoked token
- [ ] Tests: backend cross-tenant tests — cannot invite to another org
