# API — Feedback Platform

Diseño de la API REST. Contrato vivo: el OpenAPI generado por el backend (springdoc, `/v3/api-docs`) es la referencia ejecutable; este documento explica el diseño y las convenciones. Cambios incompatibles ⇒ nueva versión de path.

---

## 1. Convenciones

| Aspecto | Convención |
|---|---|
| Base dashboard | `/api/v1` — autenticada por cookie (ver §3) |
| Base pública | `/api/public/v1` — sin sesión; identificación por `publicKey` |
| Formato | JSON (`application/json; charset=utf-8`), camelCase |
| Timestamps | ISO-8601 UTC (`2026-03-04T10:15:30Z`) |
| IDs | UUID en path y payloads |
| Errores | RFC 7807 Problem Details (ADR-015), ver §5 |
| Paginación | Cursor (ADR-014), ver §4 |
| Escrituras | Validación bean-validation en DTOs; 400 con `errors[]` por campo |
| Rate limit | `429` + `Retry-After` + headers `X-RateLimit-*` |
| Trazabilidad | `X-Request-Id` aceptado/generado; se devuelve en la respuesta y va a logs |

## 2. Mejoras respecto al borrador inicial

1. **Auth**: añadido `POST /auth/refresh` (rotación) y `POST /auth/password/change` (post-MVP, listado como futuro).
2. **Invitaciones**: aceptación con token fuera del scope de org: `GET /invitations/{token}` + `POST /invitations/{token}/accept`. Gestión de miembros: `PATCH`/`DELETE` de member y cambio de rol.
3. **Tags**: CRUD bajo proyecto (`/projects/{id}/tags`) + asignación/desasignación sobre feedback.
4. **Desvincular issue**: `DELETE /feedback/{id}/issue` (explícito, idempotente) además de `PATCH` con `issueId: null`.
5. **Comentarios en issues**: mismos endpoints que en feedback (`/issues/{id}/comments`).
6. **Adjuntos**: `GET /attachments/{id}/download` con autorización → redirect a URL prefirmada.
7. **Unificación**: todas las colecciones devuelven `{ data, page }`.
8. **Ingesta**: multipart con parte `payload` JSON + parte `screenshot` opcional; JSON puro aceptado si no hay screenshot.

## 3. Autenticación

Cookies `HttpOnly; Secure; SameSite=Lax`:

- `fp_access`: JWT 15 min.
- `fp_refresh`: opaco, 30 días, rota en cada `POST /auth/refresh`.

Mutaciones autenticadas requieren header `X-Requested-With: fetch` (anti-CSRF, ver ARCHITECTURE §4). Un `401` con `code=TOKEN_EXPIRED` indica al cliente que llame a `/auth/refresh` y reintente una vez.

## 4. Paginación, filtros y orden

Request: `GET ...?cursor=eyJ...&limit=25` (def 25, máx 100).

```json
{
  "data": [ /* ... */ ],
  "page": { "nextCursor": "eyJjcmVhdGVkQXQiOi...", "hasMore": true }
}
```

Filtros del inbox (`GET /projects/{id}/feedback`):
`type`, `status`, `priority`, `tagId`, `issueId` (`none`|`any`|uuid), `q` (FTS sobre título+descripción), `from`, `to` (ISO dates), `sort=createdAt|priority`, `order=desc|asc`.

## 5. Errores

```json
{
  "type": "https://feedbackplatform.dev/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "errors": [{ "field": "title", "code": "SIZE", "message": "must be ≤ 200 chars" }],
  "traceId": "7f3a…"
}
```

Códigos estables (extracto): `VALIDATION_ERROR`, `UNAUTHENTICATED`, `TOKEN_EXPIRED`, `FORBIDDEN`, `ORGANIZATION_NOT_FOUND`, `PROJECT_NOT_FOUND`, `FEEDBACK_NOT_FOUND`, `ISSUE_NOT_FOUND`, `INVALID_PROJECT_KEY`, `RATE_LIMITED`, `PAYLOAD_TOO_LARGE`, `INVALID_INVITATION`, `SLUG_TAKEN`, `INVALID_STATE_TRANSITION`, `LAST_OWNER`, `INTERNAL_ERROR`.

Regla de aislamiento: recurso existente pero de otro tenant ⇒ **404**, nunca 403 (no revelar existencia). `FORBIDDEN` se reserva para rol insuficiente dentro del propio tenant.

## 6. Endpoints

### 6.1 Auth — `/api/v1/auth`

| Método | Path | Descripción | Auth |
|---|---|---|---|
| POST | `/register` | Crear cuenta (+ org inicial opcional) | pública (rate-limited) |
| POST | `/login` | Login; set cookies | pública (rate-limited) |
| POST | `/logout` | Revoca refresh actual | cookie |
| POST | `/refresh` | Rota refresh, nuevo access | cookie refresh |
| GET | `/me` | Usuario actual + memberships (orgs y roles) | cookie |

`POST /register`

```json
{ "email": "alex@acme.com", "name": "Alex", "password": "min-12-chars", "organizationName": "Acme" }
→ 201 { "user": { "id": "...", "email": "...", "name": "..." }, "organizations": [ { "id": "...", "slug": "acme", "role": "OWNER" } ] }
```

`GET /me` → `{ "id", "email", "name", "avatarUrl", "organizations": [ { "id", "name", "slug", "role" } ] }`

### 6.2 Organizations — `/api/v1/organizations`

| Método | Path | Descripción | Rol mín. |
|---|---|---|---|
| GET | `` | Orgs del usuario actual | miembro |
| POST | `` | Crear org (creador = OWNER) | — |
| GET | `/{organizationId}` | Detalle | miembro |
| PATCH | `/{organizationId}` | Renombrar (slug inmutable tras creación en MVP) | ADMIN |
| GET | `/{organizationId}/members` | Lista miembros | miembro |
| PATCH | `/{organizationId}/members/{memberId}` | Cambiar rol (no al último OWNER) | ADMIN |
| DELETE | `/{organizationId}/members/{memberId}` | Expulsar (no al último OWNER) | ADMIN |
| POST | `/{organizationId}/invitations` | Invitar `{email, role}` → link/token | ADMIN |
| DELETE | `/{organizationId}/invitations/{invitationId}` | Revocar | ADMIN |

Invitaciones (fuera del scope de org; el usuario las resuelve logueado o tras registrarse):

| Método | Path | Descripción |
|---|---|---|
| GET | `/api/v1/invitations/{token}` | Info pública mínima (org, rol, email destino) |
| POST | `/api/v1/invitations/{token}/accept` | Aceptar → crea membership |

### 6.3 Projects

| Método | Path | Descripción | Rol mín. |
|---|---|---|---|
| GET | `/api/v1/organizations/{orgId}/projects` | Lista | miembro |
| POST | `/api/v1/organizations/{orgId}/projects` | Crear; genera `publicKey` | ADMIN |
| GET | `/api/v1/projects/{projectId}` | Detalle | miembro |
| PATCH | `/api/v1/projects/{projectId}` | Editar nombre, environment, allowedOrigins | ADMIN |
| POST | `/api/v1/projects/{projectId}/rotate-key` | Nueva `publicKey` (invalida la anterior) | ADMIN |

`POST .../projects` request/response:

```json
{ "name": "Web App", "environment": "PRODUCTION", "allowedOrigins": ["https://app.acme.com"] }
→ 201 { "id": "...", "slug": "web-app", "publicKey": "fpk_9f2…", "environment": "PRODUCTION", "allowedOrigins": [...] }
```

### 6.4 Feedback

| Método | Path | Descripción |
|---|---|---|
| GET | `/api/v1/projects/{projectId}/feedback` | Inbox: cursor + filtros (§4) |
| POST | `/api/v1/projects/{projectId}/feedback` | Crear manualmente (`source=MANUAL`, `reporterId`=usuario actual) |
| GET | `/api/v1/feedback/{feedbackId}` | Detalle completo (contexto, eventos, adjuntos, tags, comentarios) |
| PATCH | `/api/v1/feedback/{feedbackId}` | `{status?, priority?, assigneeId?, title?, description?}` |
| POST | `/api/v1/feedback/{feedbackId}/tags` | `{tagId}` asignar |
| DELETE | `/api/v1/feedback/{feedbackId}/tags/{tagId}` | Desasignar |
| POST | `/api/v1/feedback/{feedbackId}/comments` | `{body}` |
| GET | `/api/v1/feedback/{feedbackId}/comments` | Lista |
| POST | `/api/v1/feedback/{feedbackId}/attachments` | multipart (miembros; screenshots de la ingesta llegan por la API pública) |
| DELETE | `/api/v1/feedback/{feedbackId}/issue` | Desvincular del issue actual |

`PATCH /feedback/{id}` — reglas:
- Cambio de `status` valida transición (DATA_MODEL §7); inválida ⇒ `INVALID_STATE_TRANSITION` (409).
- Cada cambio de estado/prioridad/asignación genera audit log.
- `assigneeId` debe ser miembro de la org.

`GET /feedback/{id}` — respuesta (forma):

```json
{
  "id": "0190…", "type": "BUG", "status": "NEW", "priority": "HIGH", "source": "WIDGET",
  "title": "No puedo añadir método de pago",
  "description": "…",
  "reporter": null,
  "externalUser": { "id": "u_123", "email": "enduser@customer.com" },
  "context": {
    "url": "https://app.acme.com/billing", "route": "/billing",
    "browser": "Chrome", "browserVersion": "122", "operatingSystem": "macOS",
    "viewport": { "width": 1512, "height": 945 }, "appVersion": "2.14.0"
  },
  "metadata": { "plan": "pro" },
  "technicalContext": { "sdkVersion": "0.4.1", "timezone": "Europe/Madrid" },
  "screenshotUrl": "/api/v1/attachments/0190…/download",
  "tags": [{ "id": "…", "name": "billing", "color": "#E11D48" }],
  "issue": null,
  "createdAt": "2026-03-04T10:15:30Z"
}
```

`GET /feedback/{id}/events` → timeline ordenada `occurredAt ASC`.

### 6.5 Issues

| Método | Path | Descripción |
|---|---|---|
| GET | `/api/v1/projects/{projectId}/issues` | Lista (cursor, filtros status/priority/q) |
| POST | `/api/v1/projects/{projectId}/issues` | Crear `{title, description?, priority?}` |
| GET | `/api/v1/issues/{issueId}` | Detalle + feedbacks vinculados (resumen) |
| PATCH | `/api/v1/issues/{issueId}` | `{status?, priority?, assigneeId?, title?, description?}` |
| POST | `/api/v1/issues/{issueId}/feedback/{feedbackId}` | Vincular |
| DELETE | `/api/v1/issues/{issueId}/feedback/{feedbackId}` | Desvincular |
| POST | `/api/v1/issues/{issueId}/comments` | Comentar |
| GET | `/api/v1/issues/{issueId}/comments` | Lista |

Vincular: el feedback debe pertenecer al **mismo proyecto** (409 `CROSS_PROJECT_LINK` si no). Auditoría en ambas direcciones.

### 6.6 Tags

| Método | Path |
|---|---|
| GET | `/api/v1/projects/{projectId}/tags` |
| POST | `/api/v1/projects/{projectId}/tags` `{name, color}` |
| PATCH | `/api/v1/tags/{tagId}` |
| DELETE | `/api/v1/tags/{tagId}` |

### 6.7 Adjuntos

| Método | Path | Descripción |
|---|---|---|
| GET | `/api/v1/attachments/{attachmentId}/download` | Autoriza y redirige (302) a URL prefirmada (TTL 5 min) |

### 6.8 Auditoría

| Método | Path |
|---|---|
| GET | `/api/v1/projects/{projectId}/audit` (cursor; filtro `entityType`, `action`) |

### 6.9 Public ingestion — `/api/public/v1`

**`POST /api/public/v1/feedback`**

Sin cookies. Identificación por `publicKey` (header `X-Feedback-Key` **o** campo `projectKey` del payload; header preferente).

- Content-Types: `multipart/form-data` (parte `payload`: JSON; parte `screenshot`: imagen ≤ 5 MB) o `application/json` (sin screenshot).
- CORS: origen debe estar en `allowedOrigins` del proyecto (si el proyecto define lista no vacía).
- Rate limit: 20/min y 100/h por (publicKey, IP) → `429` + `Retry-After`.
- Tamaños: payload ≤ 100 KB; `events` ≤ 50; `metadata` ≤ 10 KB; strings truncadas según esquema.
- El servidor deriva `organizationId`, `projectId`, `ipHash`, `userAgent`; **se ignoran** si vienen en el payload.

Payload (parte `payload`):

```json
{
  "type": "BUG",
  "title": "No puedo añadir método de pago",
  "description": "…",
  "source": "WIDGET",
  "user": { "id": "u_123", "email": "enduser@customer.com" },
  "context": {
    "url": "https://app.acme.com/billing", "route": "/billing",
    "browser": "Chrome", "browserVersion": "122", "operatingSystem": "macOS",
    "viewport": { "width": 1512, "height": 945 }, "appVersion": "2.14.0"
  },
  "metadata": { "plan": "pro" },
  "technicalContext": { "sdkVersion": "0.4.1", "timezone": "Europe/Madrid" },
  "events": [
    { "type": "PAGE_VIEW", "name": "Opened /billing", "data": { "route": "/billing" }, "occurredAt": "2026-03-04T10:14:02Z" },
    { "type": "NETWORK_ERROR", "name": "POST /api/payment-method 500", "data": { "method": "POST", "status": 500 }, "occurredAt": "2026-03-04T10:14:41Z" }
  ]
}
→ 201 { "id": "0190…" }
→ 401 { "code": "INVALID_PROJECT_KEY" } · 413 PAYLOAD_TOO_LARGE · 429 RATE_LIMITED
```

## 7. Endpoints futuros (no implementar aún)

- `GET /api/public/v1/roadmap?projectKey=…`, `POST /api/public/v1/roadmap/{itemId}/vote` (Phase 8).
- `POST /api/v1/integrations/slack` … (Phase 7).
- `POST /api/v1/auth/password/reset`, verificación de email, OAuth.
- Webhooks salientes: `POST /api/v1/projects/{id}/webhooks`.

## 8. Versionado y compatibilidad

- Cambios aditivos (nuevo campo en respuesta) permitidos en la misma versión.
- Cambios incompatibles ⇒ `/api/v2`. La API pública se mantiene **muy** conservadora (los SDKs instalados no se actualizan solos).
- El frontend genera sus tipos desde el OpenAPI: cualquier drift rompe el build (deseable).
