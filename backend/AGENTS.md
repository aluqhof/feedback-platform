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
├── auth/
│   ├── domain/          # entidades JPA, enums
│   ├── dto/             # request/response DTOs
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── AuthRepository.java
│   └── AuthMapper.java  # si aplica
├── organization/
│   ├── domain/
│   ├── dto/
│   ├── OrganizationController.java
│   ├── OrganizationService.java
│   ├── OrganizationRepository.java
│   └── OrganizationMapper.java
├── project/
│   ├── domain/
│   ├── dto/
│   ├── ProjectController.java
│   ├── ProjectService.java
│   ├── ProjectRepository.java
│   └── ...
├── feedback/
├── issue/
├── comment/
├── attachment/
├── ingestion/
├── audit/
└── shared/   # config, error, security, persistence, storage, web, util
```

### Reglas de estructura por modelo

Cada dominio/modelo es una **carpeta autocontenida** con todo lo necesario dentro:

```
<modelo>/
├── domain/              # Entidad JPA, enums del dominio, value objects
├── dto/                 # DTOs de request/response (records)
├── <Modelo>Controller.java
├── <Modelo>Service.java
├── <Modelo>Repository.java
└── <Modelo>Mapper.java  # solo si hay mapeo complejo
```

- **Todo lo relacionado con una entidad vive dentro de su carpeta.** No crear carpetas transversales tipo `services/`, `repositories/`, `controllers/`.
- **Las entidades JPA nunca se exponen como DTO de API.**
- Sin ceremonia extra en CRUDs triviales.

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

### Lombok — obligatorio

- **Siempre** usar anotaciones de Lombok para eliminar boilerplate:
  - `@Data`, `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@ToString`, `@EqualsAndHashCode` en entidades y DTOs.
  - `@Slf4j` para logging (nunca crear el logger manualmente).
  - `@RequiredArgsConstructor` para inyección de dependencias por constructor (nunca `@Autowired` en campos).
  - `@Value` para DTOs inmutables cuando aplique.
- **Prohibido** escribir getters/setters/constructors/tostring manualmente si Lombok lo cubre.

### Simplicidad ante todo

- **La implementación más corta y legible siempre gana.** Tres líneas claras > veinte líneas "bien abstractas".
- Sin abstracciones "por si acaso": tres líneas duplicadas son mejores que una abstracción prematura.
- Métodos cortos (máximo ~20 líneas de lógica real); si crece, extraer a un método privado con nombre descriptivo.
- Validación en DTOs con bean-validation; sin lógica en controllers.
- Preferir records de Java para DTOs simples.
- No crear interfaces de service "por si necesitamos cambiar la implementación" — solo si hay una razón real.
- Un controller no debe tener más de ~5 endpoints; si tiene más, probablemente es un dominio distinto.

### General

- Inglés en código y comentarios; nombres explícitos (`resolveProjectByPublicKey`, no `getProj`).
- Inyección por constructor (vía `@RequiredArgsConstructor` de Lombok).

## Comunicación con otros proyectos

- `frontend/` consume `/api/v1` (proxy same-origin) y genera tipos desde nuestro OpenAPI: **cualquier cambio de contrato rompe su build** — coordinarlo.
- `sdk/`/`widget/` (futuros) consumen `/api/public/v1`: contrato ultrasensible, cambios solo aditivos.
- Documentos compartidos en `/docs`: actualizar `API.md`/`DATA_MODEL.md` cuando cambie el contrato o el esquema; ADR nuevo en `DECISIONS.md` para decisiones arquitectónicas.
