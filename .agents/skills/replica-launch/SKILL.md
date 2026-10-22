---
name: "replica-launch"
slash_command: "/replica-launch"
stage: "10 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/brand.md, replica/entrepreneur.md, replica/recon.md"
writes_artifact: "replica/store-listing.json"
description: >-
  Produces submission-ready iOS App Store and Google Play Store copy in replica/store-listing.json and lints character limits and banned claims via listing.py.
---

# /replica-launch — App Store, Google Play & Web Launch Metadata (Stage 10 of 11)

## Purpose & When to Invoke
Run as Stage 10 to prepare store listings and launch copy that pass automated App Store / Play Store review guidelines.

## Inputs & Context
- `replica/brand.md`, `replica/entrepreneur.md`, and the forbidden competitor tokens from `replica/recon.md`.

## Step-by-Step Execution Protocol
1. Draft `replica/store-listing.json` containing `iosTitle`, `iosSubtitle`, `iosKeywords`, `iosDescription`, `androidTitle`, `androidShort`, and `androidFull`.
2. Enforce strict character budgets: `iosTitle <= 30`, `iosSubtitle <= 30`, `iosKeywords <= 100` (comma-separated, no spaces after commas, no duplicates), `androidTitle <= 30`, `androidShort <= 80`.
3. Run `listing.py` with `--forbid "<OriginalName>,<OriginalDomain>"` to verify zero character overflows, zero banned ranking/price claims (`#1`, `best`, `top`, `free`), and zero competitor name leaks.
4. Fix any reported errors or warnings until `listing.py` exits with code `0`.

## Clean-Room & Anti-Plagiarism Rules
- Never mention the competitor’s brand name or domain inside store titles, subtitles, keywords, or descriptions.

## Deterministic Verification Gate
Run this mandatory verification command before completing `/replica-launch`:
```bash
python3 .agents/skills/replica-launch/scripts/listing.py replica/store-listing.json --forbid "<OriginalName>,<OriginalDomain>"
```
If the script exits with code `1`, fix every reported violation or gap before moving to the next stage.

## Required Output Format (`replica/store-listing.json`)
```markdown
{
  "iosTitle": "BrandName: Core Value",
  "iosSubtitle": "Fast Workflow & Sync",
  "iosKeywords": "workflow,productivity,sync,export,schedule,automation",
  "iosDescription": "Full iOS description highlighting solved user pain points...",
  "androidTitle": "BrandName: Smart Workflow",
  "androidShort": "Fast workflow automation with multi-source sync and instant CSV export.",
  "androidFull": "Full Google Play description..."
}
```

## Acceptance Gate
- **Artifact Written**: `replica/store-listing.json`
- **Pass Criteria**: `listing.py replica/store-listing.json --forbid "<OriginalName>,<OriginalDomain>"` exits with code `0` and `0` errors.
