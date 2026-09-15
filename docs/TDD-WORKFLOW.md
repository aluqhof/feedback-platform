# TDD Workflow — Feedback Platform

> Este documento describe el workflow completo de desarrollo guiado por tests (TDD) para este proyecto, adaptando los skills de [Matt Pocock](https://github.com/mattpocock/skills/tree/main/skills/engineering) al ecosistema Pi con subagentes especializados.

## Filosofía

- **Specs primero**: toda feature parte de una especificación escrita, no de código.
- **Tickets verticales**: cada ticket corta una rebanada completa (schema → API → UI → tests), no una capa horizontal.
- **Red antes que green**: test fallando primero, luego la implementación mínima.
- **Subagentes por dominio**: backend, frontend, infra, CI/CD y seguridad tienen agentes especializados.
- **Modelos diferenciados**: orquestación y specs con modelo potente (más caro, mejor contexto); tickets e implementación con modelos eficientes.

---

## Fases del workflow

### Fase 1: Definir la feature (orquestador, modelo potente)

**Objetivo**: entender qué hay que construir y documentarlo.

**Herramientas**:
- `/skill:grill-me` — entrevista para afilar requisitos (stateless).
- `/skill:domain-modeling` — afilar lenguaje de dominio y actualizar `CONTEXT.md` / ADRs.

**Salida**: conversación clara sobre qué construir, qué no construir, y qué decisiones arquitectónicas aplican.

**Modelo recomendado**: el más fuerte disponible (máximo contexto y razonamiento).

---

### Fase 2: Escribir el spec (orquestador, modelo potente)

**Objetivo**: convertir la conversación en un documento de especificación formal.

**Herramienta**: `/skill:to-spec`

**Proceso**:
1. Explorar el estado actual del repo (`docs/PLAN.md`, `ARCHITECTURE.md`, `API.md`, `DECISIONS.md`).
2. Identificar los **seams** (fronteras públicas) donde se testeará.
3. Escribir el spec en `.scratch/<feature-slug>/spec.md`.
4. Confirmar con el usuario: problem statement, out of scope, asignación de subagentes.

**Contenido del spec**:
- Problem Statement
- Solution
- User Stories (lista exhaustiva)
- Implementation Decisions (módulos, interfaces, schema, API)
- Testing Decisions (seams, prior art)
- Out of Scope
- Subagent Assignment (quién implementa qué)
- Further Notes

**Modelo recomendado**: potente. Esta fase es "la conversación cara" que pasa una sola vez por feature.

---

### Fase 3: Crear tickets (puede ser modelo más barato)

**Objetivo**: partir el spec en tickets tracer-bullet con dependencias.

**Herramienta**: `/skill:to-tickets`

**Reglas de slicing vertical**:
- Cada ticket corta un camino COMPLETO a través de todas las capas.
- Un ticket terminado es demostrable o verificable solo.
- Cada ticket cabe en una ventana de contexto fresca.
- Prefactoring primero si hace falta.

**Excepción — wide refactors**:
Si un cambio mecánico (renombrar columna, retypear símbolo compartido) rompe miles de call sites, no forzarlo en un tracer bullet. Usar **expand–contract**:
1. Expand: añadir la nueva forma junto a la vieja.
2. Migrar call sites en lotes (un ticket por lote).
3. Contract: borrar la forma vieja cuando ningún caller la use.

**Salida**: archivos `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numerados en orden de dependencia.

**Modelo recomendado**: capaz pero eficiente. El spec ya contiene las decisiones difíciles; los tickets son puramente descomposición estructural.

---

### Fase 4: Implementar cada ticket (subagentes especializados)

**Objetivo**: construir el código, test-first, delegando al subagente adecuado.

**Herramienta**: `/skill:orchestrate`

**Asignación de subagentes**:

| Dominio | Subagent | Qué hace |
|---|---|---|
| Backend | `backend-core` | Modelo, migraciones, servicios, repos, endpoints REST |
| Frontend | `frontend-dev` | Dashboard Next.js, UI, RSC, formularios, cliente API |
| Infraestructura | `infra` | Docker, docker-compose, Dockerfiles multi-stage, deploy |
| CI/CD | `cicd` | GitHub Actions, quality gates, E2E Playwright, contratos |
| Seguridad | `security` | Auth, JWT, autorización, multi-tenant, rate limiting |

**Proceso por ticket**:
1. Leer el ticket y el spec.
2. Elegir subagente según la tabla.
3. Lanzar el subagente con un **meta-prompt compacto** que incluya:
   - Objetivo (una frase del ticket)
   - Repo, cwd, boundary de autoridad
   - Contratos relevantes (AGENTS.md, ARCHITECTURE.md, ADRs, API.md)
   - Seams acordados para testear
   - Criterios de éxito y validación
   - Condiciones de parada/pregunta
4. El subagente ejecuta **TDD internamente**: un test → implementación mínima → repetir.
5. El parent valida: typecheck, tests, revisión de fronteras.
6. `/skill:code-review` antes de marcar done.

**Reglas de oro**:
- **Un subagente por ticket**. Si un ticket cruza dominios, partirlo más con `/to-tickets`.
- **Async por defecto**: el parent supervisa mientras el subagente trabaja.
- **Nunca dos writers en el mismo cwd**: si hace falta paralelismo real, usar `isolation: "worktree"`.
- **El parent no escribe código en modo orquestador**: solo valida, arbitra y acepta.

**Modelo recomendado**:
- Parent orquestador: potente (debe validar salida de subagentes y detectar problemas de integración).
- Subagentes: default o fast capable. El spec ya fija las decisiones; el subagente ejecuta en scope acotado.

---

### Fase 5: Code review (paralelo, modelo potente)

**Objetivo**: revisar el diff antes de mergear.

**Herramienta**: `/skill:code-review`

**Dos ejes en paralelo**:
1. **Standards**: ¿sigue las convenciones del repo? (AGENTS.md, estilo, Fowler smells)
2. **Spec**: ¿implementa fielmente lo que pedía el spec/ticket?

**Salida**: informe agregado con hallazgos por eje. El parent decide qué arreglar antes de merge.

**Modelo recomendado**: potente para los subagentes de review.

---

### Fase 6: Cierre

**Objetivo**: marcar el ticket como hecho y anunciar la nueva frontera.

1. Actualizar el archivo del ticket: status `done`, commit range implementado.
2. Si este ticket desbloqueaba otros, anunciar que la frontera ha avanzado.
3. Si era el último ticket de la feature, ofrecer actualizar `docs/PLAN.md`.

---

## Skills disponibles

### Router
- `/skill:ask-pi` — ¿qué skill o flujo necesito ahora?

### Fases del flujo principal
- `/skill:grill-me` — entrevista para afilar requisitos
- `/skill:to-spec` — conversación → spec escrito
- `/skill:to-tickets` — spec → tickets tracer-bullet
- `/skill:orchestrate` — dispatcher de implementación a subagentes

### Construcción
- `/skill:tdd` — red-green-refactor, referencia de qué es un buen test
- `/skill:domain-modeling` — afilar lenguaje de dominio, actualizar CONTEXT.md/ADRs

### Validación
- `/skill:code-review` — revisión de dos ejes (Standards + Spec)

### Setup
- `/skill:setup-feedback-platform` — configurar tracker local, docs de dominio, convenciones

---

## Higiene de contexto

- Mantener fases 1–3 (grill → spec → tickets) en **una misma ventana de contexto** sin `/clear`. El spec y los tickets deben construir sobre el mismo pensamiento.
- Cada `/skill:orchestrate` o `/skill:implement` empieza **fresco**, trabajando desde el ticket.
- El límite es la **smart zone** (~150k tokens en modelos state-of-the-art). Si una sesión se acerca antes de `/to-tickets`, compactar en el boundary de fase más cercano.

## On-ramps (entradas alternativas)

| Situación | Entrada | Flujo |
|---|---|---|
| Idea nueva | `/skill:grill-me` → `/to-spec` → `/to-tickets` → `/orchestrate` | Principal |
| Bug difícil | `/skill:tdd` primero para el test de regresión, luego fix | TDD directo |
| Cambio pequeño | `/skill:implement` o `/skill:tdd` en la sesión actual | Directo |
| Deuda técnica | `/skill:code-review` en rama actual, luego refactor como feature | Health |
| Decisión arquitectónica dura | `/skill:council-mode` para convocar consejo | Standalone |

---

## Convenciones del tracker local

Ubicación: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`

Formato por ticket:

```markdown
# <NN>: <Título>

**What to build:** comportamiento end-to-end que este ticket habilita.

**Blocked by:** números/títulos de tickets bloqueantes, o "None".

**Status:** ready-for-agent | in-progress | done

- [ ] Criterio de aceptación 1
- [ ] Criterio de aceptación 2
```

**Frontera**: cualquier ticket cuyos bloqueantes estén todos en `done`. Se trabaja frontier-first.
