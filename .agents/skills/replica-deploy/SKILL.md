---
name: "replica-deploy"
slash_command: "/replica-deploy"
stage: "11 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/recon.md, replica/features.csv, replica/bugs.md, replica/store-listing.json"
writes_artifact: "replica/deploy-manifest.md"
description: >-
  Executes the final pre-deploy sanitization gate (sweep.py) across the entire codebase to guarantee zero competitor brand, domain, or hex leaks before shipping.
---

# /replica-deploy — Clean-Room Sanitization Sweep & Release Manifest (Stage 11 of 11)

## Purpose & When to Invoke
Run as the final Stage 11 gate before publishing the repository or deploying to production.

## Inputs & Context
- Complete application codebase, `replica/recon.md` forbidden tokens list, and all prior `replica/*` artifacts.

## Step-by-Step Execution Protocol
1. Extract the complete list of forbidden incumbent tokens (brand name, domain, primary hex, secondary hex) from `replica/recon.md`.
2. Run `sweep.py --root . --forbid "<OriginalName>,<OriginalDomain>,<OriginalHex>,<SecondaryHex>"` across the repository.
3. If `sweep.py` finds even a single leaked identifier, comment, URL, or hex code (`exit_code: 1`), refactor the offending files and re-run `sweep.py` until `violation_count == 0`.
4. Re-run `parity.py --entrepreneur` and `listing.py` to confirm all release gates pass simultaneously with exit code `0`.
5. Generate `replica/deploy-manifest.md` recording the final verification outputs and production build instructions.

## Clean-Room & Anti-Plagiarism Rules
- Deployment is strictly blocked (`BLOCKED_DIRTY_SWEEP`) if any file outside `replica/` contains a forbidden token.

## Deterministic Verification Gate
Run this mandatory verification command before completing `/replica-deploy`:
```bash
python3 .agents/skills/replica-deploy/scripts/sweep.py --root . --forbid "<OriginalName>,<OriginalDomain>,<OriginalHex>"
python3 .agents/skills/replica-diff/scripts/parity.py replica/features.csv --bugs replica/bugs.md --entrepreneur
```
If the script exits with code `1`, fix every reported violation or gap before moving to the next stage.

## Required Output Format (`replica/deploy-manifest.md`)
```markdown
# Clean-Room Release Manifest (/replica-deploy)
- **sweep.py Gate**: CLEAN_READY_TO_DEPLOY (0 violations, exit_code: 0)
- **parity.py Gate**: BETTER THAN THE ORIGINAL (exit_code: 0)
- **listing.py Gate**: PASSED (exit_code: 0)
```

## Acceptance Gate
- **Artifact Written**: `replica/deploy-manifest.md`
- **Pass Criteria**: `sweep.py`, `parity.py --entrepreneur`, and `listing.py` all return `exit_code: 0` and `replica/deploy-manifest.md` is written.
