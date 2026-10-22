---
name: "replica-entrepreneur"
slash_command: "/replica-entrepreneur"
stage: "8 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/recon.md, replica/diff-report.md"
writes_artifact: "replica/reviews.csv + replica/entrepreneur.md"
description: >-
  Gathers real 1-to-3 star user complaints with verifiable URLs, filters them through reviews.py, and ships concrete improvements that make the clone better than the original.
---

# /replica-entrepreneur — Evidence-Based Product Improvements (Fix What Users Hate) (Stage 8 of 11)

## Purpose & When to Invoke
Run as Stage 8 once baseline parity (`SHIPPABLE`) is achieved, transforming the clone into a superior product.

## Inputs & Context
- Public user reviews from G2, Trustpilot, Capterra, Reddit, Hacker News, or App Store / Play Store for the target incumbent.

## Step-by-Step Execution Protocol
1. Research real 1-star to 3-star user complaints about the incumbent app (focusing on artificial paywalls, dark patterns, missing exports, slow workflows, or confusing UX).
2. Record every complaint in `replica/reviews.csv` with columns `id,source,url,rating,theme,quote`. Every row MUST include a direct `http://` or `https://` URL.
3. Run `reviews.py replica/reviews.csv`. The script automatically drops unlinked rows and requires `>= 3` quotes across `>= 2` unique sources to mark a theme `VERIFIED_OPPORTUNITY` (otherwise `THIN_EVIDENCE`).
4. Select the top `VERIFIED_OPPORTUNITY` themes and implement concrete features or UX fixes directly into the application code to solve those pain points.
5. Document the verified complaint themes, source URLs, and shipped code changes in `replica/entrepreneur.md`, then re-run `parity.py --entrepreneur` to upgrade the verdict to `BETTER THAN THE ORIGINAL`.

## Clean-Room & Anti-Plagiarism Rules
- Zero hallucinated reviews: never invent quotes or dummy URLs. If a theme has `< 3` linked quotes or `< 2` sources, treat it as `THIN_EVIDENCE` and do not prioritize it.

## Deterministic Verification Gate
Run this mandatory verification command before completing `/replica-entrepreneur`:
```bash
python3 .agents/skills/replica-entrepreneur/scripts/reviews.py replica/reviews.csv
```
If the script exits with code `1`, fix every reported violation or gap before moving to the next stage.

## Required Output Format (`replica/reviews.csv + replica/entrepreneur.md`)
```markdown
# Entrepreneur Upgrades: Fixing What Users Hate (/replica-entrepreneur)
## Verified Complaint Themes (via reviews.py)
1. **paywalled-core-workflow** (VERIFIED_OPPORTUNITY · 3 quotes across g2.com, reddit.com, trustpilot.com)
   - *Fix Shipped*: Unlocked multi-source sync and 1-click CSV export in the base workflow.
```

## Acceptance Gate
- **Artifact Written**: `replica/reviews.csv + replica/entrepreneur.md`
- **Pass Criteria**: `reviews.py` exits with code `0` (`>= 1` `VERIFIED_OPPORTUNITY` theme) and the corresponding product improvements are live in the app and documented in `replica/entrepreneur.md`.
