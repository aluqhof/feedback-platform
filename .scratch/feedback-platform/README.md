# Feedback Platform — Tickets

Vertical tracer-bullet tickets for the Feedback Platform MVP. Each ticket cuts through backend, frontend, and tests.

## Phase 0 — Foundation ✅
Repo structure, docker-compose, Spring Boot skeleton, Next.js skeleton, docs.

## Phase 1 — Authentication + Tenancy
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 01 | User can register and log in | — | backend-core + frontend-dev |
| 02 | User can view and manage their session | 01 | backend-core + frontend-dev |
| 03 | User can create and switch organizations | 02 | backend-core + frontend-dev |
| 04 | User can invite team members | 03 | backend-core + frontend-dev |
| 05 | User can create and manage projects | 03 | backend-core + frontend-dev |
| 06 | Authorization is enforced on every endpoint | 03, 04, 05 | backend-core + security |

## Phase 2 — Feedback Core
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 07 | Public feedback ingestion endpoint | 05 | backend-core |
| 08 | Feedback inbox with pagination and filters | 07 | backend-core + frontend-dev |
| 09 | Feedback detail and state management | 08 | backend-core + frontend-dev |

## Phase 3 — Context
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 10 | Feedback context schema | 09 | backend-core |
| 11 | Screenshot upload via multipart ingestion | 10 | backend-core |
| 12 | Display technical context and event timeline | 11 | frontend-dev + backend-core |

## Phase 4 — Team Workflow
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 13 | Tags, comments, and audit log schema | 12 | backend-core |
| 14 | Tags and member assignment on feedback | 13 | backend-core + frontend-dev |
| 15 | Comments and audit log UI | 14 | backend-core + frontend-dev |

## Phase 5 — Issues
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 16 | Issues schema and CRUD | 15 | backend-core + frontend-dev |
| 17 | Link and unlink feedback to issues | 16 | backend-core + frontend-dev |

## Phase 6 — Widget / SDK
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 18 | SDK scaffold and initialization | 17 | frontend-dev |
| 19 | SDK context capture and event buffer | 18 | frontend-dev |
| 20 | SDK screenshot capture and ingestion | 19 | frontend-dev |

## Phase 7 — Integrations
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 21 | Outgoing webhook framework | 17 | backend-core |
| 22 | Slack integration for critical feedback | 21 | backend-core + frontend-dev |

## Phase 8 — Roadmap
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 23 | Public roadmap page | 22 | backend-core + frontend-dev |

## Phase 9 — Intelligence
| # | Ticket | Blocked by | Assignee |
|---|--------|-----------|----------|
| 24 | Automatic fingerprinting and duplicate suggestion | 17 | backend-core + frontend-dev |
| 25 | AI interface with no-op default | 24 | backend-core |
