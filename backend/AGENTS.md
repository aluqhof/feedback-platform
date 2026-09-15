> **Workflow**: este proyecto usa TDD con skills de Pi. ¿No sabes qué skill usar? → `/skill:ask-pi`. Workflow completo: `/docs/TDD-WORKFLOW.md`.

# AGENTS — backend/

Guía para agentes de IA (y humanos) que trabajen en este proyecto. Léela entera antes de tocar código. Las decisiones arquitectónicas viven en `/docs` (compartidos); este archivo es específico del backend.

## Finalidad

API REST de la plataforma: **toda** la lógica de negocio, autenticación, autorización multi-tenant, persistencia, ingesta pública de feedback, storage de archivos y auditoría.

## Stack

Java 21 · Spring Boot 3.4.x (Web, Security, Data JPA, Validation, Actuator) · PostgreSQL 16 + Flyway · Redis · springdoc-openapi · Maven · JUnit 5 + Testcontainers.

## Estructura

Modular monolith por dominios (detalle y reglas en `/docs/ARCHITECTURE.md` §2.2):

```
com.feedbackplatform
├── auth/ organization/ project/ feedback/ issue/ comment/ attachment/ ingestion/ audit/
└── shared/   # config, error, security, persistence, storage, web, util
```

Cada dominio: `*Controller` → `*Service` (application) → `*Repository`, con `domain/` (entidades, enums) y `dto/`. Sin ceremonia extra en CRUDs triviales, pero **las entidades JPA nunca se exponen como DTO de API**.

## Responsabilidades y límites

**Pertenece aquí:**
- Reglas de negocio, validaciones de dominio, transiciones de estado.
- Autorización por organización/rol en la capa de service (cada operación tenant-scoped).
- Autenticación (JWT + refresh rotativo), hashing de passwords (BCrypt).
- Resolución de `publicKey`, rate limiting, deduplicación (Redis).
- Migraciones Flyway (`src/main/resources/db/migration/V{n}__desc.sql`).
- OpenAPI correcto (el frontend genera sus tipos desde aquí).

**NO pertenece aquí:**
- Nada de UI o preocupaciones de frontend.
- Binarios en PostgreSQL (van a object storage vía `FileStorageService`).
- Datos persistentes en Redis (solo efímero: cache/rate-limit/fingerprints — ADR-004).
- Kafka, microservicios, event sourcing, CQRS (prohibidos sin ADR nuevo — ADR-001).
- Trust en `organizationId`/`projectId` del cliente: se verifica contra el recurso real (ADR-010).

## Convenciones

- UUID en IDs; `timestamptz` UTC; `snake_case` en DB, `camelCase` en Java/JSON.
- Enums de DB como `varchar` + `CHECK`; el enum Java es la fuente.
- Errores: lanzar `ApiException(code, status)`; el `GlobalExceptionHandler` produce Problem Details (ADR-015). Nunca devolver stacktraces.
- Paginación por cursor en listas grandes (ADR-014).
- Recurso de otro tenant ⇒ **404**, no 403.
- Logs: JSON, sin PII ni secretos; `traceId` en MDC siempre.
- Comunicación entre módulos: solo vía services de aplicación públicos; efectos laterales con eventos de Spring (los consume `audit`).

## Comandos

```bash
./mvnw spring-boot:run     # arrancar (requiere docker compose up -d en la raíz)
./mvnw test                # tests unitarios + integración (Testcontainers)
./mvnw verify              # todo: tests + análisis
./mvnw flyway:info         # estado de migraciones
```

Swagger UI (dev): `http://localhost:8080/swagger-ui.html` · OpenAPI: `/v3/api-docs`.

## Testing

- Unit para servicios y reglas; `@WebMvcTest` para controllers; `@SpringBootTest` + Testcontainers (PostgreSQL y Redis reales) para integración.
- **Obligatorio**: test cross-tenant por cada endpoint sensible (acceder a recurso de otra org ⇒ 404); test de rate limit en ingesta; test de rotación/reuso de refresh tokens.
- Toda migración va acompañada de su test de integración que la ejerce.
- Bugfix ⇒ test de regresión en el mismo PR.

## Estilo de código

- Inglés en código y comentarios; nombres explícitos (`resolveProjectByPublicKey`, no `getProj`).
- Constructores para inyección (sin `@Autowired` en campos).
- Métodos cortos; validación en DTOs con bean-validation; sin lógica en controllers.
- Sin abstracciones "por si acaso": tres líneas duplicadas son mejores que una abstracción prematura.

## Comunicación con otros proyectos

- `frontend/` consume `/api/v1` (proxy same-origin) y genera tipos desde nuestro OpenAPI: **cualquier cambio de contrato rompe su build** — coordinarlo.
- `sdk/`/`widget/` (futuros) consumen `/api/public/v1`: contrato ultrasensible, cambios solo aditivos.
- Documentos compartidos en `/docs`: actualizar `API.md`/`DATA_MODEL.md` cuando cambie el contrato o el esquema; ADR nuevo en `DECISIONS.md` para decisiones arquitectónicas.
