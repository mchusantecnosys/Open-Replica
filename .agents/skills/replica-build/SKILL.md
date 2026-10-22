---
name: "replica-build"
slash_command: "/replica-build"
stage: "4 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/recon.md, replica/architecture.md, replica/design-system.md, replica/features.csv"
writes_artifact: "Application UI Code + replica/features.csv"
description: >-
  Systematically builds every screen (S01..SNN) from the recon map using the clean-room design tokens, wiring all interactive states and updating replica/features.csv.
---

# /replica-build — Screen-by-Screen Clean-Room Frontend Build (Stage 4 of 11)

## Purpose & When to Invoke
Run as Stage 4 to construct the application shell, navigation, and all user flows mapped in `replica/recon.md`.

## Inputs & Context
- `replica/recon.md`, `replica/architecture.md`, `replica/design-system.md`, and `replica/features.csv`.

## Step-by-Step Execution Protocol
1. Implement the application shell and navigation following the layout geometry in `replica/recon.md` and tokens in `replica/design-system.md`.
2. Build each screen `S01..SNN` in sequence, ensuring every screen supports 4 complete states: Empty state (with clear CTA), Loading state, Error state, and Populated state.
3. Wire every form, filter, modal, and button to real application state and validation—never leave dead clicks or placeholder alerts.
4. Verify responsive behavior at both `1440x900` (desktop) and `390x844` (mobile) with zero horizontal overflow.
5. As each feature in `replica/features.csv` is completed and verified, update its `clone` column from `no` to `yes` (or `partial` if incomplete).

## Clean-Room & Anti-Plagiarism Rules
- Never import or reference any asset, class name, or string literal belonging to the incumbent app.
- Be strictly honest in `replica/features.csv`: only mark `clone=yes` when the full end-to-end user flow works.

## Required Output Format (`Application UI Code + replica/features.csv`)
```markdown
id,screen_id,feature,priority,clone,notes
F-01,S01,"Primary workspace view with live filtering",must,yes,"Clean-room implementation complete"
F-02,S02,"Validated creation flow with persistence",must,yes,"Wired end-to-end"
```

## Acceptance Gate
- **Artifact Written**: `Application UI Code + replica/features.csv`
- **Pass Criteria**: Application compiles with 0 errors, all screens `S01..SNN` are interactive at desktop and mobile viewports, and `replica/features.csv` reflects current build status.
