# PLAN — Feedback Platform

> Estado: **Fase 0 (planificación)**. Este documento es la fuente de verdad sobre *qué* construimos, *por qué* y *en qué orden*.
> Cualquier desviación del plan debe actualizarse aquí y, si es arquitectónica, registrarse en `DECISIONS.md`.

---

## 1. Finalidad del producto

Plataforma de feedback para productos SaaS. Las empresas integran un widget/SDK en su aplicación y sus usuarios finales envían feedback **con contexto técnico capturado automáticamente** (URL, navegador, viewport, versión de la app, errores recientes, requests fallidas, eventos previos, screenshot).

El equipo del SaaS gestiona ese feedback desde un dashboard centralizado: visualizar, filtrar, priorizar, agrupar en Issues y convertirlo en trabajo accionable.

Posicionamiento a largo plazo: entre **Canny** (feedback + roadmap), **UserVoice** (gestión de feedback), **Sentry** (contexto técnico), **Intercom** (relación con el usuario) y **Linear** (workflow de issues). Inicialmente: un MVP muy enfocado en la captura rica de feedback y su gestión básica.

## 2. Usuarios objetivo

- **Equipos de producto** de SaaS pequeños y medianos (PMs, founders).
- **Equipos de ingeniería** que necesitan contexto técnico real para reproducir bugs.
- **Equipos de soporte/CS** que quieren enlazar feedback de usuarios a problemas conocidos.

El usuario final (quien reporta desde el widget) **no es cliente directo de la plataforma**: es usuario del SaaS que integra nuestro SDK.

## 3. Problema que resolvemos

1. El feedback de usuarios llega sin contexto técnico ("no funciona el pago") y reproducirlo cuesta horas.
2. El feedback está disperso (email, Slack, soporte, redes) y no hay una bandeja única.
3. No hay forma sencilla de saber cuántos usuarios reportan lo mismo ni de priorizar con datos.
4. Las herramientas existentes o son caras/genéricas (UserVoice), o no unen contexto técnico + gestión de producto.

## 4. Propuesta de valor

> **Feedback accionable con contexto técnico completo, capturado automáticamente, agrupable en issues y gestionable desde un único inbox.**

Diferenciadores:
- Contexto técnico de serie en cada feedback (lo que Sentry hace para errores, nosotros para feedback humano).
- Timeline de eventos previos al reporte (qué hizo el usuario antes de quejarse).
- Consolidación de feedback repetido en Issues (señal de priorización).
- Base preparada para roadmap público y votaciones.

## 5. Alcance del MVP

### Dentro (MVP)

**Autenticación**
- Registro, login, logout, sesión con refresh tokens, `GET /me`.
- Verificación de email y reset de contraseña: *diferido* (ver §26, riesgo asumido y documentado).

**Organizaciones y proyectos**
- Crear/editar organización, cambiar entre organizaciones.
- Invitar miembros (invitación por token de un solo uso vía email o link compartible en dev).
- Roles: `OWNER`, `ADMIN`, `MEMBER`.
- Crear/editar/listar proyectos; `publicKey` generada automáticamente; `allowedOrigins` configurables.

**Ingesta pública**
- `POST /api/public/v1/feedback` (multipart JSON + screenshot opcional).
- Identificación por `publicKey`, rate limiting, CORS por proyecto, validación y límites de tamaño.

**Inbox de feedback**
- Lista paginada (cursor), búsqueda full-text, filtros: tipo, estado, prioridad, tag, fecha, issue vinculado/no vinculado.
- Orden por fecha (desc/asc) y prioridad.

**Detalle de feedback**
- Todos los campos, metadata, contexto técnico, timeline de eventos, screenshot/adjuntos.

**Gestión**
- Cambiar estado y prioridad, tags (crear/asignar/eliminar), asignar responsable (miembro de la org), comentarios internos, crear Issue, vincular/desvincular a Issue existente.

**Issues**
- CRUD básico, ciclo de vida, ver feedbacks vinculados, comentarios.

**Auditoría**
- Registro de acciones de gestión (cambios de estado/prioridad/asignación, vínculos, creación de issues).

**Operación**
- Health endpoints, logs estructurados con correlation ID, docker-compose local.

### Fuera (MVP)

- SDK/widget real (la ingesta se prueba con HTTP directo).
- Roadmap público y votaciones.
- Integraciones (Slack, Linear, GitHub…).
- IA (títulos automáticos, deduplicación inteligente, resúmenes).
- Notificaciones por email transaccional (salvo invitaciones).
- OAuth/SSO, verificación de email, 2FA.
- Billing.
- Adjuntos arbitrarios más allá del screenshot (la entidad `Attachment` lo soporta, la UI no).

## 6. Funcionalidades futuras

Orden aproximado de valor:

1. **SDK + Widget** (`sdk/`, `widget/`): init, identify, captura automática de contexto, buffer de eventos, screenshot (html2canvas o similar).
2. **Integraciones**: Slack (nuevo feedback crítico), Linear/GitHub (issue ↔ issue), email.
3. **Roadmap público**: publicar Issues, votos, estados (`UNDER_CONSIDERATION`, `PLANNED`, `IN_DEVELOPMENT`, `RELEASED`), notificación a votantes.
4. **Deduplicación automática**: fingerprints, sugerencia de duplicados.
5. **IA** (nunca núcleo): categorización, prioridad sugerida, resúmenes, detección de tendencias.
6. **Notificaciones in-app y por email** para el equipo.
7. **API keys personales / tokens de servicio**, webhooks salientes.
8. **SSO/OAuth**, verificación de email obligatoria, 2FA.

## 7. Arquitectura

**Modular monolith** en Spring Boot 4 + Next.js como dashboard + PostgreSQL + Redis + almacenamiento de objetos. Sin microservicios, Kafka, Kubernetes, event sourcing ni CQRS.

```
Dashboard (Browser)                 SaaS cliente (Browser)
      │                                    │
      ▼                                    ▼
┌───────────────┐                POST /api/public/v1/feedback
│  Next.js      │                          │
│  (dashboard)  │                          ▼
│  proxy /api/* │──────────────► ┌──────────────────────┐
└───────────────┘                │  Spring Boot 4       │
                                 │  (modular monolith)  │
                                 │                      │
                                 │  auth · organization │
                                 │  project · feedback  │
                                 │  issue · comment     │
                                 │  attachment · audit  │
                                 │  ingestion           │
                                 └──────┬───────┬───────┘
                                        │       │
                            ┌───────────┘       └────────────┐
                            ▼                                ▼
                    ┌──────────────┐                 ┌──────────────┐
                    │ PostgreSQL   │                 │    Redis     │
                    │ (verdad      │                 │ cache · rate │
                    │  persistente)│                 │ limit · dedup│
                    └──────────────┘                 └──────────────┘
                            ┌──────────────┐
                            │ Object       │
                            │ storage      │
                            │ (MinIO/S3)   │
                            └──────────────┘
```

Regla de oro: **Next.js no contiene lógica de negocio**. Es presentación + consumidor de la API.

Detalle completo en `ARCHITECTURE.md`.

## 8. Responsabilidades de cada componente

| Componente | Responsabilidad | NO hace |
|---|---|---|
| `frontend/` (Next.js) | Dashboard: UI, routing, forms, fetching, validación de formularios (UX) | Lógica de negocio, autorización real, acceso a DB |
| `backend/` (Spring Boot) | Toda la lógica de negocio, authN/authZ, persistencia, ingesta pública, storage, auditoría | Renderizado de UI |
| PostgreSQL | Fuente de verdad persistente | Cache, colas, binarios |
| Redis | Rate limiting, cache (publicKey→project), dedup temporal, locks, contadores | Datos persistentes críticos |
| Object storage | Screenshots y adjuntos | Metadatos (van en PostgreSQL) |
| `sdk/` (futuro) | Captura de contexto en el navegador del usuario final, buffer de eventos, envío a ingesta | Renderizado del widget complejo (eso es `widget/`), auth del dashboard |
| `widget/` (futuro) | UI embebible del formulario de feedback | Lógica de captura (eso es `sdk/`) |

## 9. Modelo de datos inicial

Resumen (detalle completo en `DATA_MODEL.md`):

- **User** — cuenta de la plataforma (miembro del equipo, no usuario final).
- **Organization** — tenant. Aislamiento de datos por `organization_id`.
- **OrganizationMember** — user ↔ organization con rol (`OWNER|ADMIN|MEMBER`).
- **Project** — pertenece a org; tiene `public_key`, `environment`, `allowed_origins`.
- **Feedback** — entidad principal. `organization_id` desnormalizado (defensa en profundidad), `project_id`, `reporter_id` nullable, `issue_id` nullable, enums type/status/priority, contexto técnico en columnas + `metadata`/`technical_context` JSONB, `fingerprint` (nullable, para dedup futura).
- **FeedbackEvent** — timeline previo al reporte (`PAGE_VIEW|CLICK|NETWORK_ERROR|CONSOLE_ERROR|CUSTOM`).
- **Issue** — problema consolidado; N feedbacks apuntan a 1 issue.
- **Tag / FeedbackTag** — etiquetas por proyecto, relación N:M.
- **Comment** — tabla única con FK exclusiva (`feedback_id` XOR `issue_id`).
- **Attachment** — screenshots/archivos; binarios en object storage, aquí metadatos (`storage_key`).
- **Invitation** — invitaciones a organizaciones (token hasheado, expiración).
- **RefreshToken** — sesiones (rotación, detección de reuso).
- **AuditLog** — quién cambió qué, cuándo (`data` JSONB con before/after).

Decisiones asociadas: `ProjectMember` **no** se crea en MVP (ADR-013); comentarios polimórficos con FK exclusiva (ADR-012); screenshot como `Attachment(kind=SCREENSHOT)` expuesto como `screenshotUrl` en la API, sin columna duplicada en `feedback` (ver DATA_MODEL).

## 10. API

REST versionado: `/api/v1` (dashboard, autenticado) y `/api/public/v1` (ingesta, sin sesión). Detalle en `API.md`.

Decisiones clave:
- Errores en formato **RFC 7807 Problem Details**.
- Paginación por **cursor** en listas grandes (`?cursor=&limit=`), respuesta `{ data, page: { nextCursor, hasMore } }`.
- Recursos anidados por organización/proyecto cuando el scope importa (`/api/v1/projects/{projectId}/feedback`); acceso por ID directo para operaciones sobre un recurso concreto (`/api/v1/feedback/{id}`).
- En ingesta, el cliente **nunca** envía `organizationId`: se resuelve desde el `Project` identificado por `publicKey`.
- OpenAPI generado con springdoc; tipos TS del frontend generados desde el esquema (evita duplicación).

## 11. Seguridad

- **AuthN**: ver §12.
- **AuthZ**: verificación de membresía/rol por organización en la capa de aplicación en **cada** operación que toca datos tenant-scoped. Nunca confiar en `organizationId`/`projectId` del cliente: se verifica que el recurso pertenece al tenant y que el usuario tiene rol suficiente. Tests de aislamiento cross-tenant obligatorios (§17).
- **CORS**: dashboard servido vía proxy same-origin de Next (sin CORS). API pública: CORS restringido a `project.allowed_origins`.
- **CSRF**: cookies `SameSite=Lax` + header custom obligatorio en mutaciones (defensa en profundidad); token CSRF si hiciera falta cross-site.
- **XSS**: React escapa por defecto; CSP en headers; sanitización si se renderiza markdown en el futuro.
- **SQL injection**: JPA/parámetros nombrados siempre; queries nativas solo con bind params.
- **Rate limiting**: Redis (ver §15).
- **Uploads**: validación MIME real (magic bytes), límite de tamaño (5 MB screenshot), extensiones permitidas (png/jpeg/webp), storage keys opacos.
- **Headers**: `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, CSP.
- **Secretos**: variables de entorno; nunca en repo; `IP_HASH_SECRET`, `JWT_SECRET` rotables.
- **Logs**: sin passwords, tokens, emails de usuarios finales ni cuerpos de request completos. IPs solo como HMAC (`ip_hash`).

## 12. Autenticación

**Decisión (ADR-006)**: JWT de acceso de corta duración (15 min, HS256) + refresh token opaco con **rotación y detección de reuso**, persistido hasheado en `refresh_tokens`. Ambos en cookies `HttpOnly; Secure; SameSite=Lax`.

Flujo:
1. `POST /auth/register|/login` → set-cookie access + refresh.
2. Frontend llama a la API vía proxy same-origin; el access token viaja en cookie.
3. Al expirar el access token → `POST /auth/refresh` (rota el refresh; reuso de uno viejo revoca la cadena).
4. `POST /auth/logout` → revoca refresh actual.

Justificación y alternativas en ADR-006. Passwords con BCrypt (coste 12).

## 13. Multi-tenancy

**Decisión (ADR-010)**: schema compartido, discriminación por `organization_id` en todas las tablas tenant-scoped, enforcement en capa de aplicación:

- Todo query tenant-scoped incluye `organization_id` (vía el recurso padre verificado).
- `Feedback` e `Issue` llevan `organization_id` desnormalizado para que ningún JOIN incorrecto pueda filtrar datos.
- Resolución de acceso: `SecurityContext → userId → membership(orgId) → rol`. Los controllers reciben IDs de path; el service verifica pertenencia **antes** de operar. Not-found (404) en lugar de 403 cuando el recurso no pertenece al tenant (no filtrar existencia).
- Tests de autorización cross-org obligatorios por endpoint sensible.

Escala adecuadamente hasta decenas de miles de tenants; la migración a schema-per-tenant o RLS es posible luego si hace falta (documentado en ADR-010).

## 14. Gestión de archivos

**Decisión (ADR-009)**: abstracción `FileStorageService` (`put(key, bytes, contentType)`, `getPresignedGet(key, ttl)`, `delete(key)`).

- Dev: MinIO en docker-compose (S3-compatible).
- Prod: S3 o Cloudflare R2.
- PostgreSQL solo guarda metadatos (`attachments.storage_key`), nunca binarios.
- Subida MVP: multipart a la API de ingesta (≤5 MB) o al endpoint de attachments autenticado; el backend valida y sube a storage. Presigned PUT directo a storage: fase posterior.

## 15. Redis

Usos iniciales (diseño de claves en `ARCHITECTURE.md`):

| Caso | Clave | TTL |
|---|---|---|
| Cache proyecto por publicKey | `project:pk:{publicKey}` → JSON (id, orgId, origins) | 5 min + invalidación en update |
| Rate limit ingesta | `rl:ingest:{publicKey}:{ipHash}` (ventana deslizante) | 1 h |
| Rate limit auth | `rl:auth:{ip}:{email}` | 15 min |
| Dedup temporal (futuro) | `fp:{fingerprint}` → issueId | 24 h |
| Locks distribuidos (futuro) | `lock:{resource}` | corto |

Límites iniciales de ingesta: **20 req/min y 100 req/h por (publicKey, IP)**; payload JSON ≤ 100 KB; ≤ 50 eventos por feedback; screenshot ≤ 5 MB. Ajustables por configuración.

**No** se usa Redis como store principal ni como cola en MVP. Procesamiento asíncrono: Spring `@Async`/eventos primero; si crece, cola real (Redis streams o similar) detrás de una interfaz.

## 16. Observabilidad

Desde el MVP:
- Logs JSON estructurados (Logstash encoder) con `traceId`/`requestId` en MDC (filtro que genera/propaga `X-Request-Id`).
- Actuator: `/actuator/health` (liveness/readiness), `/actuator/info`, métricas Micrometer.
- Timings por request en log; contadores de ingesta (aceptados/rechazados/rate-limited).
- Preparado para: OpenTelemetry (agent), Prometheus (`/actuator/prometheus`), Sentry. Se añaden por configuración sin cambios de diseño.

## 17. Testing

**Backend**
- Unit: reglas de negocio (transiciones de estado, permisos, rate limiting).
- Integración: API slices con Testcontainers (PostgreSQL + Redis reales).
- Repositorio: queries custom, índices, FTS.
- **Autorización cross-tenant**: test por endpoint sensible intentando acceder a recursos de otra org (espera 404).
- Contrato: verificar que el OpenAPI generado no rompe compatibilidad (fase posterior).

**Frontend**
- Unit: utils, hooks, validación (Vitest).
- Componentes: Testing Library para componentes con lógica (formularios, filtros).
- E2E (Playwright): los 8 flujos críticos:
  1. registro → 2. crear organization → 3. crear project → 4. recibir feedback (HTTP directo a ingesta) → 5. ver feedback en inbox → 6. cambiar estado → 7. crear issue → 8. vincular feedback.

**Calidad**: backend `gradle check` verde y frontend `tsc && lint && test` verdes como requisito de merge.

## 18. Desarrollo local

`docker-compose.yml` (raíz): PostgreSQL 16, Redis 7, MinIO (+ mc init bucket). Backend y frontend se ejecutan en la máquina host contra estos servicios.

```bash
docker compose up -d          # infra
cd backend && ./gradlew bootRun
cd frontend && pnpm dev
```

Comandos completos en cada `AGENTS.md`. El `docker-compose.yml` se crea en Phase 0 (primera tarea de implementación).

## 19. Despliegue

Estrategia inicial deliberadamente simple:
- Backend: contenedor único (JAR) detrás de TLS; variables de entorno para config.
- Frontend: contenedor Next standalone.
- PostgreSQL y Redis gestionados; S3/R2 para archivos.
- Sin Kubernetes. Un servicio de contenedores sencillo (Fly.io/Render/ECS single-service) basta para el MVP.
- Migraciones Flyway al arrancar la app (baseline desde V1).

## 20. Roadmap de implementación

Cada fase tiene criterio de salida verificable. No empezar una fase sin cerrar la anterior (salvo trabajo paralelo frontend/backend dentro de la misma fase).

### Phase 0 — Foundation
- Estructura de repo, `/docs`, AGENTS.md (✅ este entregable).
- `docker-compose.yml`: PostgreSQL 16 + Redis 7 + MinIO.
- Backend skeleton: Spring Boot 4, Gradle, Flyway, Actuator, error handling (ProblemDetail), correlation ID, OpenAPI, health. Endpoint `GET /api/v1/ping`.
- Frontend skeleton: Next.js + TS strict + Tailwind, estructura `src/`, proxy `/api` → backend, página placeholder.
- **Salida**: `docker compose up` + backend + frontend levantan; health OK; Swagger UI accesible en dev.

### Phase 1 — Authentication + tenancy
- Migraciones V1: users, organizations, organization_members, projects, invitations, refresh_tokens.
- Auth: register/login/logout/refresh/me; cookies; rate limit de login.
- Organizations + memberships + invitaciones (link con token).
- Projects CRUD + generación de `publicKey` + `allowedOrigins`.
- Enforcement de autorización por org + tests cross-tenant.
- Frontend: login/register, selector de org, lista/creación de proyectos.
- **Salida**: flujo E2E 1–3 en verde; tests de aislamiento.

### Phase 2 — Feedback core
- Migración V2: feedback (sin contexto rico aún), enums.
- Ingesta pública mínima (JSON, sin screenshot), rate limiting, resolución publicKey→project con cache Redis.
- Inbox: lista con cursor, filtros (tipo/estado/prioridad/fecha), búsqueda FTS.
- Detalle; cambios de estado y prioridad.
- **Salida**: E2E 4–6 en verde.

### Phase 3 — Context
- Migración V3: metadata/technical_context JSONB, feedback_events, attachments.
- Ingesta multipart con screenshot; MinIO integrado tras `FileStorageService`.
- Detalle muestra contexto, timeline de eventos, screenshot.
- **Salida**: feedback con contexto completo visible en dashboard.

### Phase 4 — Team workflow
- Migración V4: tags, feedback_tags, comments, audit_logs.
- Asignación de responsable; tags CRUD; comentarios en feedback; audit log consultable.
- **Salida**: gestión colaborativa completa sobre un feedback.

### Phase 5 — Issues
- Migración V5: issues, link feedback↔issue.
- CRUD issues, vincular/desvincular, contador de feedbacks, comentarios en issues, ciclo de vida.
- Deduplicación manual (vincular a mano); campo `fingerprint` listo para automatizar.
- **Salida**: E2E 7–8; varios feedbacks consolidados en un issue.

### Phase 6 — Widget / SDK
- Nuevos proyectos `sdk/` + `widget/` con sus `AGENTS.md`.
- `Feedback.init({ projectKey, user, appVersion, metadata })`, buffer de eventos, captura de contexto, screenshot, envío a ingesta.
- **Salida**: demo HTML externa enviando feedback real al inbox.

### Phase 7 — Integrations
- Módulo `integration/` + webhooks salientes; Slack primero; Linear/GitHub después.
- **Salida**: feedback crítico → mensaje en Slack.

### Phase 8 — Roadmap
- Módulo `roadmap/`: publicar issues, votos, estados, página pública.
- **Salida**: roadmap público por proyecto con votación.

### Phase 9 — Intelligence
- Fingerprints automáticos + sugerencia de duplicados (Redis + consultas).
- IA opcional tras una interfaz (`Summarizer`, `Categorizer`) con implementación no-op por defecto.
- **Salida**: sugerencias de agrupación funcionando sin IA; IA como mejora opcional.

---

## Apéndice A — Convenciones transversales

- Identificadores UUID v4 (o v7 si el driver lo facilita) generados en DB/app, nunca secuenciales expuestos.
- Timestamps `timestamptz` en UTC; la API serializa ISO-8601 con `Z`.
- Nombres: `snake_case` en DB, `camelCase` en JSON/Java/TS.
- Migraciones Flyway: `V{n}__{descripcion}.sql`, irreversibles hacia delante (no edits de migraciones aplicadas).
- Respuestas de error: Problem Details con `code` de dominio estable.
- Commits/PRs: pequeños, con migración + tests en el mismo PR que el cambio de modelo.

## Apéndice B — Riesgos conocidos (se aceptan conscientemente)

1. **Spring Boot 4 es reciente** (GA nov-2025): vigilar compatibilidad de springdoc/Testcontainers. Plan B si algo crítico falla: Boot 3.5.x manteniendo la misma arquitectura.
2. **Sin verificación de email en MVP**: mitigado con rate limiting en registro/login; se añade en cuanto haya proveedor de email.
3. **Screenshot cross-origin**: la captura fiable en el widget (html2canvas) tiene limitaciones conocidas; se investigará en Phase 6 con fallback a "sin screenshot".
4. **FTS en PostgreSQL** puede quedarse corto a gran escala: aceptable para MVP; OpenSearch sería decisión futura.
5. **Envío de emails** (invitaciones): MVP usa proveedor configurable (SMTP/SES/Resend); en dev, los links se loguean.
