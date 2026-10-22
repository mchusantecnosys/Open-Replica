---
name: "replica-test"
slash_command: "/replica-test"
stage: "6 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/recon.md, replica/features.csv"
writes_artifact: "replica/bugs.md + replica/clone-screens/"
description: >-
  Exercises every user journey in a real headless browser, captures clone screenshots (S01..SNN), and logs/fixes S1, S2, and S3 defects.
---

# /replica-test — Headless Browser E2E Verification & Bug Hunt (Stage 6 of 11)

## Purpose & When to Invoke
Run as Stage 6 after `/replica-build` and `/replica-backend` to test the live running application in Chromium.

## Inputs & Context
- Running local application server, `replica/recon.md`, and `replica/features.csv`.

## Step-by-Step Execution Protocol
1. Open the running clone in headless Chromium at `1440x900` and `390x844` and capture screenshots into `replica/clone-screens/S01.png`, `S02.png`, etc., matching the original screen IDs.
2. Execute every `must` and `should` user journey end-to-end: submit empty forms, submit valid forms, reload the page to confirm persistence, and test rapid double-clicks.
3. Inspect browser console logs and network requests for uncaught exceptions or `4xx`/`5xx` failures.
4. Log every discovered defect in `replica/bugs.md` with severity `S1` (critical crash/data loss/security), `S2` (broken core feature), or `S3` (minor visual/polish issue) and status `open` or `fixed`.
5. Fix all `S1` and `S2` bugs immediately, re-test in the browser, and update their status to `fixed` in `replica/bugs.md`.

## Clean-Room & Anti-Plagiarism Rules
- Never mark a bug `fixed` in `replica/bugs.md` without re-running the browser reproduction step after the code edit.

## Required Output Format (`replica/bugs.md + replica/clone-screens/`)
```markdown
# E2E Bug Hunt Log (/replica-test)
| Bug ID | Severity | Screen | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| BUG-01 | S1 | S02 | fixed | Double-clicking submit created duplicate entries |
| BUG-02 | S3 | S01 | open | Minor badge truncation on 320px viewport |
```

## Acceptance Gate
- **Artifact Written**: `replica/bugs.md + replica/clone-screens/`
- **Pass Criteria**: `replica/clone-screens/` contains captures for all screens and `replica/bugs.md` has `0` open `S1` or `S2` bugs.
