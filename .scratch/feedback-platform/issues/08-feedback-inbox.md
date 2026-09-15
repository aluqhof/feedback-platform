# 08: Feedback inbox with pagination and filters

**What to build:** Team members can view a paginated list of feedback for their project, filter by type, status, priority, and date range, and search with full-text search (FTS). Pagination uses cursor-based navigation for performance.

**Blocked by:** 07 — Public feedback ingestion endpoint

**Status:** ready-for-agent

**Assignee:** backend-core + frontend-dev

- [ ] Backend: `GET /api/v1/projects/{projectId}/feedback` — cursor pagination (`?cursor=&limit=`)
- [ ] Backend: Filters: type, status, priority, dateFrom, dateTo, hasIssue (boolean)
- [ ] Backend: Full-text search on title and description via PostgreSQL `to_tsvector`
- [ ] Backend: Response shape: `{ data: [...], page: { nextCursor, hasMore } }`
- [ ] Backend: Ensure every query includes `organization_id` verification (cross-tenant protection)
- [ ] Frontend: Feedback inbox page with table/list view
- [ ] Frontend: Filter bar — type badges, status dropdown, priority selector, date range
- [ ] Frontend: Search input with debounce
- [ ] Frontend: Cursor pagination ("Load more" or infinite scroll)
- [ ] Frontend: Empty state and loading skeletons
- [ ] Frontend: TanStack React Query for data fetching with proper invalidation on filter change
- [ ] Tests: backend integration tests for pagination, filters, FTS, cross-tenant access
- [ ] Tests: frontend component tests for filter interactions
