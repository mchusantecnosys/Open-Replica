---
name: "replica-backend"
slash_command: "/replica-backend"
stage: "5 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/architecture.md, replica/features.csv"
writes_artifact: "replica/security-checklist.md"
description: >-
  Implements server routes, database persistence, server-side schema validation, rate limiting, and verifies multi-user data isolation.
---

# /replica-backend — Secure Backend, Persistence & Multi-User Isolation (Stage 5 of 11)

## Purpose & When to Invoke
Run as Stage 5 to connect the frontend to real backend persistence and verify security controls.

## Inputs & Context
- `replica/architecture.md` and the frontend views built in `/replica-build`.

## Step-by-Step Execution Protocol
1. Implement backend API routes and database persistence matching the contracts in `replica/architecture.md`.
2. Enforce strict server-side input validation on every mutation endpoint (`POST`, `PUT`, `PATCH`, `DELETE`), rejecting malformed payloads with structured `400` errors.
3. Test multi-tenant / multi-user isolation by creating a resource as User A and attempting to read, update, or delete it using User B `(must return 0 rows or 403/404)`.
4. Add idempotency guards to prevent duplicate record creation on double-click or network retry.
5. Verify that zero API keys, external tokens, or credentials exist anywhere in the repository.
6. Document all verified controls in `replica/security-checklist.md`.

## Clean-Room & Anti-Plagiarism Rules
- Never include API keys, tokens, or credentials in client or server code.
- Never trust client-supplied user IDs or role flags without server verification.

## Required Output Format (`replica/security-checklist.md`)
```markdown
# Mandatory Backend Security Checklist (/replica-backend)
- [x] Server-side schema validation on all POST/PUT/PATCH/DELETE endpoints
- [x] Multi-user isolation verified (User B cannot access User A records)
- [x] Idempotency protection on form submissions and mutations
- [x] All timestamps stored in UTC
- [x] Zero API keys, tokens, or credentials in repository
```

## Acceptance Gate
- **Artifact Written**: `replica/security-checklist.md`
- **Pass Criteria**: `replica/security-checklist.md` is complete with all isolation, validation, and zero-credential checks marked `[x]`.
