---
name: "replica-diff"
slash_command: "/replica-diff"
stage: "7 of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "replica/features.csv, replica/bugs.md, replica/screens/, replica/clone-screens/"
writes_artifact: "replica/diff-report.md"
description: >-
  Runs parity.py and imgdiff.py to compute deterministic feature parity % and color-agnostic 4x4 Sobel edge-map structural similarity.
---

# /replica-diff — Deterministic Parity & Sobel Visual Diff Gate (Stage 7 of 11)

## Purpose & When to Invoke
Run as Stage 7 to objectively verify whether the rebuild has achieved parity with the original app.

## Inputs & Context
- `replica/features.csv`, `replica/bugs.md`, `replica/screens/S*.png`, and `replica/clone-screens/S*.png`.

## Step-by-Step Execution Protocol
1. Run `parity.py` against `replica/features.csv` and `replica/bugs.md` to compute the weighted parity score (`must=3.0`, `should=2.0`, `could=1.0`).
2. Run `imgdiff.py` on each pair of `replica/screens/S*.png` and `replica/clone-screens/S*.png` to measure 4x4 grid structural similarity using Sobel luminance edges.
3. If `parity.py` returns exit code `1` (any missing/partial `must` feature, score `< 80%`, or open `S1`/`S2` bug), return to `/replica-build` or `/replica-test` and close the gaps.
4. If `imgdiff.py` flags any 4x4 grid region with `< 70%` structural similarity, inspect the layout drift and align the structural geometry.
5. Write the combined JSON telemetry and analysis into `replica/diff-report.md`.

## Clean-Room & Anti-Plagiarism Rules
- Never manually fabricate parity percentages—always paste the exact output from `parity.py` and `imgdiff.py`.

## Deterministic Verification Gate
Run this mandatory verification command before completing `/replica-diff`:
```bash
python3 .agents/skills/replica-diff/scripts/parity.py replica/features.csv --bugs replica/bugs.md
python3 .agents/skills/replica-diff/scripts/imgdiff.py replica/screens/S01.png replica/clone-screens/S01.png --json
```
If the script exits with code `1`, fix every reported violation or gap before moving to the next stage.

## Required Output Format (`replica/diff-report.md`)
```markdown
# Deterministic Parity & Structural Diff Report (/replica-diff)
- **Parity Verdict**: SHIPPABLE (exit_code: 0)
- **Weighted Feature Score**: 94.4% (100% must-haves complete, 0 open S1/S2 bugs)
- **Sobel Structural Similarity**: 92.6% across 4x4 grid
```

## Acceptance Gate
- **Artifact Written**: `replica/diff-report.md`
- **Pass Criteria**: `parity.py` exits with code `0` (`SHIPPABLE`), `imgdiff.py` exits with code `0` (`>= 75%` structural similarity), and `replica/diff-report.md` is written.
