# Feedback Platform

Plataforma de feedback para productos SaaS: un widget/SDK captura feedback de usuarios finales **con contexto técnico automático** (URL, navegador, viewport, versión de la app, errores recientes, requests fallidas, timeline de eventos, screenshot) y el equipo lo gestiona —filtra, prioriza, etiqueta, asigna y consolida en Issues— desde un dashboard centralizado.

> **Estado: fase de planificación.** La arquitectura y el modelo de dominio están cerrados (ver `/docs`); la implementación comienza por la Phase 0 del roadmap.

## Documentación

| Documento | Contenido |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | Visión, alcance del MVP, roadmap por fases (0–9) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura del sistema, flujos, seguridad, observabilidad |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Modelo de datos completo (PostgreSQL) |
| [docs/API.md](docs/API.md) | Diseño de la API REST (`/api/v1` + `/api/public/v1`) |
| [docs/DECISIONS.md](docs/DECISIONS.md) | ADRs: modular monolith, auth, multi-tenancy, storage… |

## Stack

- **Frontend** `frontend/`: Next.js (App Router) · TypeScript · Tailwind — dashboard de administración, sin lógica de negocio.
- **Backend** `backend/`: Java 21 · Spring Boot 4 (modular monolith) · Spring Security · Spring Data JPA · OpenAPI.
- **Datos**: PostgreSQL 16 (fuente de verdad) · Redis (rate limiting, cache, dedup) · object storage S3-compatible (screenshots).
- **Futuros**: `sdk/`, `widget/`, `workers/`, `integrations/` — cada uno con su propio `AGENTS.md`.

## Estructura del repositorio

```
feedback-platform/
├── docs/                  # documentación compartida (fuente de verdad)
├── frontend/              # dashboard Next.js — ver frontend/AGENTS.md
├── backend/               # API Spring Boot — ver backend/AGENTS.md
├── docker/                # Dockerfiles y config de infra local
├── docker-compose.yml     # (Phase 0) PostgreSQL + Redis + MinIO
└── README.md
```

## Desarrollo local

*(Disponible al completar Phase 0)*

```bash
docker compose up -d                  # PostgreSQL + Redis + MinIO
cd backend && ./gradlew bootRun       # API en :8080
cd frontend && pnpm dev               # dashboard en :3000
```

Comandos, convenciones y límites de cada proyecto: su `AGENTS.md` respectivo.

## Workflow de desarrollo (TDD con Pi)

Este proyecto usa un workflow de **Test-Driven Development** orquestado con skills de Pi:

1. **Definir** — `/skill:grill-me` para afilar requisitos, `/skill:to-spec` para documentar.
2. **Ticketear** — `/skill:to-tickets` para partir el spec en tickets verticales.
3. **Implementar** — `/skill:orchestrate` para delegar cada ticket al subagente adecuado (`backend-core`, `frontend-dev`, `infra`, `cicd`, `security`).
4. **Validar** — `/skill:tdd` (red-green-refactor) + `/skill:code-review` (dos ejes: Standards + Spec).

¿No sabes qué skill usar ahora? → `/skill:ask-pi`.

Documentación completa del workflow: [`docs/TDD-WORKFLOW.md`](docs/TDD-WORKFLOW.md).

## Principios

1. Simple → mantenible → observable → escalable (en ese orden).
2. La lógica de negocio vive en el backend; Next.js es presentación.
3. Multi-tenant estricto desde el día 1: ningún UUID manipulado da acceso a otra organización.
4. PostgreSQL es la verdad; Redis es efímero; los binarios van a object storage.
5. Sin sobrearquitectura: no Kafka, no Kubernetes, no microservicios, no event sourcing (ver DECISIONS.md).
6. Toda decisión arquitectónica se documenta como ADR antes o junto a su implementación.
