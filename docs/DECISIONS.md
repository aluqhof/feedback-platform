# DECISIONS — Registro de decisiones arquitectónicas (ADR)

Formato: Context → Decision → Alternatives → Consequences. Estado por defecto: **Accepted**. Las decisiones marcadas como *Superseded* se mantienen para historia.

Índice:

| ADR | Decisión | Estado |
|---|---|---|
| 001 | Modular monolith | Accepted |
| 002 | REST sobre GraphQL | Accepted |
| 003 | PostgreSQL como fuente de verdad única | Accepted |
| 004 | Redis solo para preocupaciones efímeras | Accepted |
| 005 | UUID como identificadores | Accepted |
| 006 | Autenticación: JWT + refresh rotativo en cookies httpOnly | Accepted |
| 007 | Flyway para migraciones | Accepted |
| 008 | JSONB para payloads flexibles | Accepted |
| 009 | Abstracción FileStorageService (S3-compatible) | Accepted |
| 010 | Multi-tenancy: schema compartido + discriminación por organization_id | Accepted |
| 011 | Frontend llama al backend vía proxy same-origin de Next.js | Accepted |
| 012 | Comentarios: tabla única con FK exclusiva | Accepted |
| 013 | Sin ProjectMember en MVP | Accepted |
| 014 | Paginación por cursor en listas grandes | Accepted |
| 015 | Errores en formato RFC 7807 Problem Details | Accepted |
| 016 | Tipos TS del frontend generados desde OpenAPI | Accepted |

---

## ADR-001 — Modular monolith

**Context.** Equipo pequeño, producto nuevo, dominio aún descubriéndose. Se valoraron microservicios.

**Decision.** Un único backend Spring Boot desplegado como una unidad, organizado internamente por módulos de dominio (`auth`, `organization`, `project`, `feedback`, `issue`, `comment`, `attachment`, `ingestion`, `audit`, `shared`) con reglas de dependencia explícitas (ARCHITECTURE §2.2).

**Alternatives.** Microservicios (overhead operativo, transacciones distribuidas, complejidad prematura); monolito por capas técnicas (`controllers/`, `services/`, `repositories/` globales: acopla dominios y degrada con el tiempo).

**Consequences.** Despliegue y desarrollo simples; transacciones ACID; refactor entre módulos barato. Si un dominio necesitara escalar aparte, sus límites ya están definidos para extraerlo. Exige disciplina de módulos (reforzable con ArchUnit en tests).

## ADR-002 — REST sobre GraphQL

**Context.** La API es consumida por nuestro dashboard y por una API pública de ingesta.

**Decision.** REST con recursos anidados por tenant, versionada por path (`/api/v1`, `/api/public/v1`), documentada con OpenAPI (springdoc).

**Alternatives.** GraphQL (flexibilidad que no necesitamos; caching y rate limiting más complejos; peor encaje para una API pública sencilla); tRPC (acoplaría frontend TS al backend Java, imposible).

**Consequences.** Contrato estable, cacheable, fácil de testear y de generar tipos (ADR-016). El coste: endpoints específicos para vistas agregadas cuando haga falta (p. ej. detalle de feedback con eventos).

## ADR-003 — PostgreSQL como fuente de verdad única

**Context.** Datos relacionales con algún payload flexible y necesidad de búsqueda full-text.

**Decision.** PostgreSQL 16 para todo dato persistente. FTS con `tsvector` para la búsqueda del inbox.

**Alternatives.** MongoDB (pierde integridad relacional entre orgs/proyectos/feedback); Elasticsearch/OpenSearch desde el inicio (operación extra sin necesidad demostrada).

**Consequences.** Un solo sistema de datos que operar, backup sencillo, transacciones. Si el FTS se queda corto a escala, se añade un índice de búsqueda externo alimentado desde PostgreSQL (decisión futura).

## ADR-004 — Redis solo para preocupaciones efímeras

**Context.** Necesitamos rate limiting distribuido, cache de `publicKey→project`, deduplicación temporal futura.

**Decision.** Redis para: rate limiting (ventanas), cache con TTL e invalidación explícita, fingerprints con TTL, locks. Nada que deba sobrevivir a un flush vive solo en Redis.

**Alternatives.** Redis como store principal (riesgo de pérdida); hacer rate limiting en memoria (rompe con >1 instancia); base de datos para todo (latencia y carga innecesarias en el hot path de ingesta).

**Consequences.** La plataforma sigue funcionando (degradada: sin rate limit ni cache) si Redis cae — los fallos de Redis en cache se tratan como miss, no como error 500. Diseño de claves en ARCHITECTURE §2.4.

## ADR-005 — UUID como identificadores

**Decision.** UUID (generación aleatoria; evaluable UUIDv7 por localidad de índices) en todas las PKs.

**Alternatives.** Bigserial (IDs predecibles; filtran volumen y permiten enumeración; complican importaciones/merges futuros).

**Consequences.** IDs no enumerables, seguros de exponer en APIs públicas; peor localidad de índice B-tree que secuenciales — aceptable a nuestra escala; mitigable con UUIDv7 si aparece en benchmarks.

## ADR-006 — Autenticación: JWT + refresh rotativo en cookies httpOnly

**Context.** Dashboard SPA (Next.js) + API Java. La API pública de ingesta no usa sesión (publicKey). Se valoraron sesiones opacas en Redis y JWT puro en localStorage.

**Decision.**
- Access token JWT (HS256, secreto por env, 15 min) en cookie `HttpOnly; Secure; SameSite=Lax`.
- Refresh token opaco (30 días) en cookie igual, persistido **hasheado** en `refresh_tokens` con rotación: cada `/auth/refresh` emite uno nuevo e invalida el anterior; reuso de un token ya rotado ⇒ revocar toda la cadena del usuario.
- Frontend nunca lee los tokens (HttpOnly); CSRF mitigado con SameSite=Lax + header `X-Requested-With` obligatorio en mutaciones.

**Alternatives.** (a) Sesiones opacas en Redis: estado en Redis para cada request autenticado; válido pero añade dependencia dura de Redis al hot path de auth (contra ADR-004). (b) JWT en localStorage: expuesto a XSS. (c) Solo JWT de larga duración: imposible revocar.

**Consequences.** Auth stateless en el hot path (validar firma) + revocación real vía refresh. Coste: endpoint `/refresh` y lógica de rotación con tests obligatorios (incl. detección de reuso).

## ADR-007 — Flyway para migraciones

**Decision.** Flyway con SQL plano versionado (`V{n}__desc.sql`), migraciones forward-only, ejecutadas al arrancar la app. `validateOnMigrate` activo.

**Alternatives.** Liquibase (YAML/XML más ceremonioso y difícil de revisar en PRs; su ventaja de rollback no la usamos: preferimos migraciones compensatorias).

**Consequences.** Migraciones legibles, revisables y auditables; estado de esquema reproducible. Disciplina: nunca editar una migración ya aplicada en un entorno compartido.

## ADR-008 — JSONB para payloads flexibles

**Context.** `metadata` del cliente, `technical_context`, datos de eventos y auditoría tienen forma variable y no se consultan por igualdad relacional.

**Decision.** Columnas `jsonb` con validación de forma/tamaño en la capa de aplicación. Lo que se filtra o une por SQL vive en columnas tipadas (type, status, route…).

**Alternatives.** EAV (ilegible); columnas para todo (esquema rígido ante clientes con necesidades distintas); JSONB para todo (pierde tipado y constraints).

**Consequences.** Flexibilidad donde aporta, rigor donde importa. Consultas sobre JSONB posibles con `@>` si algún día hacen falta (índice GIN en ese momento).

## ADR-009 — Abstracción FileStorageService

**Context.** Screenshots/adjuntos. No queremos binarios en PostgreSQL ni acoplar el dominio a un proveedor.

**Decision.** Interfaz `FileStorageService` (put/presignedGet/delete) en `shared/storage`; implementaciones S3-compatible (MinIO en dev, S3/R2 en prod) y filesystem local como fallback. `attachments` guarda metadatos + `storage_key`. El screenshot del feedback es un `Attachment(kind=SCREENSHOT)`; la API lo expone como `screenshotUrl` derivado (sin columna duplicada en `feedback`).

**Alternatives.** Binarios en `bytea` (infla la DB, backups pesados); URLs públicas directas al bucket (sin control de acceso); SDK del proveedor llamado desde servicios de dominio (acoplamiento).

**Consequences.** Cambiar de proveedor = cambiar bean. Descargas autorizadas vía redirect a URL prefirmada de corta duración.

## ADR-010 — Multi-tenancy: schema compartido + discriminación por organization_id

**Context.** Multi-tenant desde el día 1 con aislamiento estricto: modificar un UUID a mano jamás debe dar acceso a otra organización.

**Decision.** Un schema; todas las tablas tenant-scoped llevan `organization_id` (desnormalizado en `feedback`, `issues`, `audit_logs`). Enforcement en la capa de aplicación: el service verifica membresía/rol del usuario sobre la org **del recurso real** (no la del path) antes de operar, y los repositorios filtran por `organization_id`. Recurso de otro tenant ⇒ 404. Tests cross-tenant obligatorios.

**Alternatives.** (a) Schema-per-tenant / DB-per-tenant: aislamiento físico pero operación y migraciones multiplicadas — prematuro. (b) Row-Level Security de Postgres: excelente defensa, pero requiere propagar contexto a la conexión y complica pooling y tests; queda como **endurecimiento futuro compatible** con este diseño (las columnas ya existen).

**Consequences.** Operación simple con aislamiento lógico fuerte, verificable en tests. El riesgo (un query sin filtro) se mitiga con: convención de repos tenant-scoped, tests de aislamiento por endpoint, y revisión obligatoria de queries nuevas.

## ADR-011 — Frontend llama al backend vía proxy same-origin de Next.js

**Context.** Auth por cookies entre `localhost:3000` (Next) y `localhost:8080` (Spring); en prod, dominios distintos.

**Decision.** `next.config.ts` rewrites: `/api/backend/*` → backend. El navegador solo habla con el origen de Next.

**Alternatives.** CORS con credenciales entre dominios (config frágil, third-party-cookie edge cases); BFF con lógica en Next (prohibido: la lógica vive en el backend).

**Consequences.** Sin CORS para el dashboard, cookies first-party, SameSite=Lax efectivo. El proxy es un paso de red trivial y Next no toma decisiones de negocio. La API pública de ingesta sí configura CORS (orígenes por proyecto) porque es cross-origin por naturaleza.

## ADR-012 — Comentarios: tabla única con FK exclusiva

**Context.** Comentarios internos sobre feedback **y** sobre issues.

**Decision.** Una tabla `comments` con `feedback_id` e `issue_id` nullable y `CHECK (num_nonnulls(feedback_id, issue_id) = 1)`.

**Alternatives.** Polimorfismo `entity_type` + `entity_id` (sin FK real: huérfanos imposibles de prevenir en DB); dos tablas `feedback_comments` / `issue_comments` (duplicación de esquema, código y queries).

**Consequences.** Integridad referencial real y una sola implementación. Si aparece un tercer objetivo de comentarios, se añade otra columna nullable y se ajusta el CHECK.

## ADR-013 — Sin ProjectMember en MVP

**Context.** ¿Permisos por proyecto además de por organización?

**Decision.** No en MVP: la membresía de organización con roles `OWNER/ADMIN/MEMBER` es el único nivel de autorización. Razonamiento y plan de extensión en DATA_MODEL §6.

**Alternatives.** `project_members` desde el inicio (más superficie de autorización y UI para un caso que aún no existe).

**Consequences.** MVP más simple y seguro (menos caminos de autorización que auditar). La extensión es aditiva y no rompe el modelo.

## ADR-014 — Paginación por cursor en listas grandes

**Decision.** Cursor opaco (`createdAt|id` en base64) para `feedback`, `issues` y `audit_logs`; respuesta `{ data, page: { nextCursor, hasMore } }`.

**Alternatives.** Offset (`?page=3`): se desalinea con inserciones concurrentes (inbox vivo) y degrada en offsets altos.

**Consequences.** Listas estables y baratas; sin "saltar a página N" (no aporta en un inbox). Filtros y orden deben ser compatibles con la clave del cursor (índices alineados, DATA_MODEL §3.7).

## ADR-015 — Errores en formato RFC 7807 Problem Details

**Decision.** Todas las respuestas de error son `application/problem+json` con `type/title/status/detail/instance` + extensiones `code` (estable, para clientes) y `traceId`. Validación: `errors[]` por campo.

**Alternatives.** Formato propio `{error, message}` (cada cliente parsea distinto; sin estándar).

**Consequences.** Spring Boot soporta `ProblemDetail` nativamente; un único `GlobalExceptionHandler` centraliza el formato; el frontend tiene un manejador de errores tipado único.

## ADR-016 — Tipos TS del frontend generados desde OpenAPI

**Decision.** `openapi-typescript` genera `src/types/api.d.ts` desde el `/v3/api-docs` del backend (tarea npm `gen:types`). El archivo generado no se edita a mano.

**Alternatives.** Modelos TS escritos a mano (drift garantizado con el backend); compartir código (imposible entre Java y TS sin herramientas extra).

**Consequences.** Un drift de contrato rompe el build del frontend en vez de fallar en runtime. Requiere que el OpenAPI del backend sea correcto (DTOs anotados).
