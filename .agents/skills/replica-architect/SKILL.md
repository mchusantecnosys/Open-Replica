---
name: "replica-architect"
slash_command: "/replica-architect"
stage: "2 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/recon.md, replica/features.csv"
writes_artifact: "replica/architecture.md"
description: >-
  Plans a proven, boring technical stack, multi-tenant database schema with Row-Level Security (RLS), server-side validation contracts, and UTC timestamp handling.
---

# /replica-architect — Clean-Room System & Security Architecture (Stage 2 of 11)

## Purpose & When to Invoke
Run as Stage 2 immediately after `/replica-recon` to translate the screen map and feature matrix into concrete database tables and API contracts.

## Inputs & Context
- `replica/recon.md` containing the screen inventory and inferred entities.
- `replica/features.csv` listing all `must` and `should` functional requirements.

## Step-by-Step Execution Protocol
1. Read `replica/recon.md` and `replica/features.csv` to identify every persistent entity, relationship, and state transition.
2. Select a proven, maintainable stack suited to the workspace (e.g., TypeScript full-stack, relational SQL/Postgres with Row-Level Security, schema validation via Zod).
3. Write complete SQL DDL statements in `replica/architecture.md`, including explicit `ENABLE ROW LEVEL SECURITY` and tenant/owner isolation policies on every user-owned table.
4. Define request/response validation schemas for every mutation route (`POST`, `PUT`, `PATCH`, `DELETE`) and webhook endpoint.
5. Specify deterministic handling for timezones (store all timestamps in UTC, render in local timezone), idempotency keys, and test-mode payment flows.

## Clean-Room & Anti-Plagiarism Rules
- Use clean, domain-generic table and column names—never copy internal API route quirks or proprietary naming from the incumbent.
- Design security and tenant isolation from day one rather than deferring auth checks.

## Required Output Format (`replica/architecture.md`)
```markdown
# System Architecture
## Database Schema & Row-Level Security
```sql
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
```
```

## Acceptance Gate
- **Artifact Written**: `replica/architecture.md`
- **Pass Criteria**: `replica/architecture.md` contains complete SQL DDL with RLS policies, API endpoint schemas, and zero external paid API lock-in.
