> **Workflow**: este proyecto usa TDD con skills de Pi. ¿No sabes qué skill usar? → `/skill:ask-pi`. Workflow completo: `/docs/TDD-WORKFLOW.md`.

# AGENTS — frontend/

Guía para agentes de IA (y humanos) que trabajen en este proyecto. Documentos compartidos en `/docs` (leer `PLAN.md` y `API.md` antes de implementar features).

## Finalidad

Dashboard de administración de la plataforma: autenticación, selector de organización/proyecto, inbox de feedback, detalle con contexto técnico y timeline, gestión (estados, prioridades, tags, asignación, comentarios), issues, miembros y configuración.

## Stack

Next.js (App Router) · TypeScript **strict** · React Server Components por defecto · Tailwind CSS · zod (validación de formularios) · Vitest + Testing Library · Playwright (E2E) · pnpm.

## Estructura

```
src/
├── middleware.ts           # redirect a /login si no hay sesión
├── app/                    # rutas (thin): (auth)/ y (app)/[orgSlug]/[projectSlug]/…
├── components/ui/          # primitivos de design system (Button, Input, Badge, Modal, Table…)
├── features/<feature>/     # auth, organizations, projects, feedback, issues, comments, members
│   ├── components/  hooks/  api.ts  schemas.ts
├── lib/api/client.ts       # fetch tipado contra /api/backend/*, errores ProblemDetails
└── types/api.d.ts          # GENERADO desde OpenAPI — no editar a mano
```

## Responsabilidades y límites

**Pertenece aquí:**
- UI, routing, layouts, formularios con validación de UX (zod), estados de carga/error/vacío.
- Fetching de datos y mutaciones contra la API; filtros del inbox en URL search params.
- Componentes accesibles (labels, foco, teclado) y responsive.

**NO pertenece aquí:**
- **Lógica de negocio** (transiciones de estado, permisos, cálculos): es del backend. El frontend muestra errores del backend, no los reinventa.
- Llamadas directas al backend por URL absoluta: siempre `/api/backend/*` (proxy same-origin, ADR-011).
- Tipos de API escritos a mano (se generan: `pnpm gen:types`).
- Secretos o tokens en el cliente (las cookies son HttpOnly; no se leen).
- Estado global pesado (Redux/Zustand) sin necesidad demostrada.

## Convenciones

- RSC por defecto; `'use client'` solo en componentes con interactividad real (eventos, hooks de estado).
- Páginas thin: componen features; no contienen lógica de fetching compleja inline.
- Un fetcher único (`lib/api/client.ts`) que parsea Problem Details y lanza `ApiError` tipada.
- Errores de validación del backend (`errors[]`) se mapean a los campos del formulario.
- Componentes pequeños y con nombre explícito; un componente por archivo.

## Comandos

```bash
pnpm dev          # desarrollo (requiere backend en :8080)
pnpm build        # build de producción
pnpm lint         # eslint
pnpm test         # Vitest
pnpm test:e2e     # Playwright (requiere stack completo levantado)
pnpm gen:types    # regenera types desde el OpenAPI del backend
```

## Testing

- Unit/component: Vitest + Testing Library para hooks, formularios y componentes con lógica (filtros, validación).
- E2E (Playwright): los 8 flujos críticos definidos en `/docs/PLAN.md` §17. No mockear la API en E2E: stack real.
- No testear píxeles; testear comportamiento (roles ARIA, texto visible).

## Estilo de código

- TypeScript estricto: prohibido `any` sin justificación en comentario.
- Inglés en código; nombres explícitos.
- Tailwind con clases utilitarias; extraer a `components/ui` lo que se repita 2+ veces.
- Formato: Prettier + eslint (config en repo); CI exige `lint && test && build` verdes.

## Comunicación con otros proyectos

- `backend/`: consume `/api/v1`. El contrato es el OpenAPI del backend; si necesitas un cambio de API, pídelo/documenta en `/docs/API.md` antes de implementarlo.
- `sdk/`/`widget/` (futuros): **no** los importa ni comparte código con ellos; son productos separados que viven en el navegador de los clientes.
