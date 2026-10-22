---
name: "replica-design"
slash_command: "/replica-design"
stage: "3 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/recon.md"
writes_artifact: "replica/design-system.md"
description: >-
  Preserves proven UX ergonomics and spatial hierarchy while replacing 100% of the incumbent brand palette, typography, iconography, and micro-copy.
---

# /replica-design — Zero-Overlap Clean-Room Design System (Stage 3 of 11)

## Purpose & When to Invoke
Run as Stage 3 before writing UI components so the rebuild has an intentional, original visual identity that will pass `sweep.py`.

## Inputs & Context
- `replica/recon.md` (specifically the Forbidden Brand Tokens list and Screen Inventory).

## Step-by-Step Execution Protocol
1. Inspect the forbidden primary and secondary hex colors in `replica/recon.md` and select a completely distinct 60-30-10 color palette (60% neutral canvas, 30% structural surface, 10% primary accent).
2. Select a characterful 2+1 font pairing: 1 geometric/editorial display font, 1 high-legibility body font, and 1 tabular monospace font (`tabular-nums`) for metrics and timestamps.
3. Define spacing scales, border radii, elevation rules (single-level elevation, hairline borders), and responsive breakpoints (`1440px` desktop, `390px` mobile).
4. Write CSS custom properties / Tailwind theme tokens and component state guidelines (hover, focus-visible, disabled, loading, empty, error) into `replica/design-system.md`.

## Clean-Room & Anti-Plagiarism Rules
- Zero color overlap: the new primary and secondary hex codes must have an obvious perceptual delta from the incumbent’s palette.
- Rewrite all UI labels, empty-state messages, and button micro-copy in fresh, direct human language.

## Required Output Format (`replica/design-system.md`)
```markdown
# Clean-Room Design System
- **Canvas (60%)**: #020617
- **Surface (30%)**: #0F172A (1px border #1E293B)
- **Primary Accent (10%)**: #10B981 (Replaces forbidden incumbent hex)
- **Typography**: Display + Sans Body + Monospace (tabular-nums)
```

## Acceptance Gate
- **Artifact Written**: `replica/design-system.md`
- **Pass Criteria**: `replica/design-system.md` defines complete CSS/Tailwind tokens, typography pairings, and zero overlap with forbidden hex codes.
