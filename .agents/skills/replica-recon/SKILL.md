---
name: "replica-recon"
slash_command: "/replica-recon"
stage: "1 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "User target URL, screenshots, or app name"
writes_artifact: "replica/recon.md + replica/features.csv"
description: >-
  Reverse-engineers any target application from public URLs, screenshots, or store listings into a structured screen map (S01..SNN), data model, and prioritized feature matrix.
---

# /replica-recon — Target Reconnaissance & Feature Inventory (Stage 1 of 11)

## Purpose & When to Invoke
Run as Stage 1 when starting a new clean-room clone. Accepts a target app name, public URL, or directory of reference screenshots.

## Inputs & Context
- Target application name, public web URL, or reference screenshots provided by the user.
- Optional scope constraints (e.g., web SaaS only, mobile-first PWA, or specific core workflow).

## Step-by-Step Execution Protocol
1. Create the `replica/screens/` and `replica/clone-screens/` directories in the project workspace.
2. Browse or inspect the target application at desktop (`1440x900`) and mobile (`390x844`) viewports, saving reference captures as `replica/screens/S01.png`, `S02.png`, etc.
3. Deconstruct every visible screen into functional user flows, interactive states, and inferred database entities in `replica/recon.md`.
4. Catalog all user-facing capabilities in `replica/features.csv` with columns `id,screen_id,feature,priority,clone,notes` where `priority` is `must`, `should`, or `could` and initial `clone` is `no`.
5. Record the incumbent app’s exact brand name, domain, and primary/secondary hex color codes in the Forbidden Brand Tokens table of `replica/recon.md` so downstream stages never leak them.
6. Provide an honest engineering complexity sizing estimate (e.g., Weekend MVP, 1-2 Weeks, or Multi-Month) and flag enterprise bloat for `clone=skip`.

## Clean-Room & Anti-Plagiarism Rules
- Never copy proprietary source code, minified bundles, or copyrighted image assets from the target app.
- Observe functional behavior and UX ergonomics from the outside (black-box reverse engineering).
- Explicitly list the target app’s brand name, domain, and hex colors as forbidden tokens.

## Required Output Format (`replica/recon.md + replica/features.csv`)
```markdown
# Clean-Room Reconnaissance: <Target App Name>
- **Incumbent Domain**: <target-domain.com>
- **Forbidden Brand Tokens**: <TargetName>, <target-domain.com>, <#PrimaryHex>, <#SecondaryHex>
- **Honest Complexity Sizing**: <e.g., 1-2 Weeks (CRUD + Auth + Core Engine)>

## Screen Inventory
- **S01**: <Primary Entry / Core Workspace Screen> (1440x900 & 390x844)
- **S02**: <Creation / Submission / Detail Flow>
- **S03**: <Dashboard / Management / Settings View>
```

## Acceptance Gate
- **Artifact Written**: `replica/recon.md + replica/features.csv`
- **Pass Criteria**: `replica/recon.md` and `replica/features.csv` exist on disk with at least 6 prioritized features (`must`/`should`/`could`), screen IDs (`S01..SNN`), and the forbidden token list.
