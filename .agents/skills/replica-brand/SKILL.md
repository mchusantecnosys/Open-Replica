---
name: "replica-brand"
slash_command: "/replica-brand"
stage: "9 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/recon.md, replica/design-system.md, replica/entrepreneur.md"
writes_artifact: "replica/brand.md"
description: >-
  Establishes a 100% independent brand name, domain structure, positioning statement, and custom SVG wordmark/favicon with zero trademark or phonetic overlap.
---

# /replica-brand — Original Brand Identity & SVG Asset Generation (Stage 9 of 11)

## Purpose & When to Invoke
Run as Stage 9 to give the improved application its own memorable brand identity before store packaging and deployment.

## Inputs & Context
- `replica/recon.md` (Forbidden Brand Tokens), `replica/design-system.md`, and `replica/entrepreneur.md`.

## Step-by-Step Execution Protocol
1. Create an original brand name and domain candidate that shares zero phonetic, prefix/suffix, or trademark similarity with the incumbent.
2. Craft a clear positioning statement anchored around the verified improvements shipped in `/replica-entrepreneur`.
3. Generate clean, original SVG assets (favicon, header wordmark, and OpenGraph social preview layout) using the palette from `replica/design-system.md`.
4. Update the application’s HTML `<title>`, meta descriptions, header wordmark, and documentation to use the new brand identity.
5. Record the complete brand specification and trademark clearance checklist in `replica/brand.md`.

## Clean-Room & Anti-Plagiarism Rules
- Never use "Open<Incumbent>", "<Incumbent>Clone", or rhyming variations of the competitor’s trademark.

## Required Output Format (`replica/brand.md`)
```markdown
# Original Brand Identity (/replica-brand)
- **Brand Name**: <NewBrandName>
- **Primary Domain**: <newbrand.io>
- **Phonetic & Trademark Overlap with Incumbent**: Zero
- **Core Value Proposition**: <1-sentence positioning around verified user pain points fixed>
```

## Acceptance Gate
- **Artifact Written**: `replica/brand.md`
- **Pass Criteria**: `replica/brand.md` is written and the application UI displays the new original brand identity and SVG icon assets.
