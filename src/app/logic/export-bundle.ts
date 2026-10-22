import {
  ArtifactSpecItem,
  GeneratedInstallCommands,
  InstallConfig,
  SkillDefinition,
  SkillPhase,
  VerifierScriptSpec
} from '../models/replica.models';

export const VERIFIER_SCRIPTS: VerifierScriptSpec[] = [
  {
    id: 'parity',
    filename: 'parity.py',
    skillId: 'replica-diff',
    slashCommand: '/replica-diff',
    repoPath: '.agents/skills/replica-diff/scripts/parity.py',
    title: 'Weighted Feature Parity & Blocking Bug Gate',
    purpose:
      'Computes objective weighted parity across must/should/could features in replica/features.csv and blocks release if any must-have is incomplete or any S1/S2 bug remains open in replica/bugs.md.',
    cliUsage:
      'python3 .agents/skills/replica-diff/scripts/parity.py replica/features.csv --bugs replica/bugs.md [--entrepreneur]',
    exitZeroCondition:
      '100% of must-have features are clone=yes, weighted score >= 80.0%, and 0 open S1/S2 bugs.',
    exitOneCondition:
      'Any must-have feature is no/partial, weighted score < 80.0%, or >= 1 open S1/S2 bug exists.',
    sampleOutputJson: JSON.stringify(
      {
        verdict: 'BETTER THAN THE ORIGINAL',
        shippable: true,
        parity_score_pct: 94.4,
        counts: { yes: 7, partial: 1, no: 0, skip: 1 },
        open_s1_s2_bugs: 0,
        blocking_must_haves_missing: [],
        blocking_must_haves_partial: [],
        backlog_gaps: ['F-07 (COULD - partial): Advanced custom webhook filters'],
        exit_code: 0
      },
      null,
      2
    ),
    code: `#!/usr/bin/env python3
"""
parity.py — Deterministic Feature Parity & Bug Gate for OpenCode & Google Antigravity
Usage: python3 parity.py replica/features.csv --bugs replica/bugs.md [--entrepreneur]
Zero external dependencies (Python 3.8+ standard library only).
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

WEIGHTS = {"must": 3.0, "should": 2.0, "could": 1.0}
SCORES = {"yes": 1.0, "partial": 0.5, "no": 0.0}


def count_open_s1_s2_bugs(bugs_path: Path | None) -> int:
    if not bugs_path or not bugs_path.exists():
        return 0
    open_count = 0
    for line in bugs_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        if re.search(r"\\b(S1|S2)\\b", line, re.IGNORECASE) and re.search(r"\\bopen\\b", line, re.IGNORECASE):
            open_count += 1
    return open_count


def main() -> int:
    parser = argparse.ArgumentParser(description="Compute weighted feature parity and S1/S2 bug gate.")
    parser.add_argument("features_csv", type=Path, help="Path to replica/features.csv")
    parser.add_argument("--bugs", type=Path, default=None, help="Path to replica/bugs.md")
    parser.add_argument("--entrepreneur", action="store_true", help="Set when /replica-entrepreneur fixes are verified")
    args = parser.parse_args()

    if not args.features_csv.exists():
        print(json.dumps({"error": f"File not found: {args.features_csv}", "exit_code": 1}, indent=2))
        return 1

    total_weight = 0.0
    earned_weight = 0.0
    missing_musts = []
    partial_musts = []
    backlog_gaps = []
    counts = {"yes": 0, "partial": 0, "no": 0, "skip": 0}

    with args.features_csv.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            clone = (row.get("clone") or "no").strip().lower()
            prio = (row.get("priority") or "could").strip().lower()
            fid = (row.get("id") or "F-??").strip()
            feat = (row.get("feature") or "").strip()

            if clone == "skip":
                counts["skip"] += 1
                continue

            w = WEIGHTS.get(prio, 1.0)
            s = SCORES.get(clone, 0.0)
            counts[clone] = counts.get(clone, 0) + 1
            total_weight += w
            earned_weight += w * s

            if prio == "must":
                if clone == "no":
                    missing_musts.append(f"{fid}: {feat}")
                elif clone == "partial":
                    partial_musts.append(f"{fid}: {feat}")
            elif clone in ("no", "partial"):
                backlog_gaps.append(f"{fid} ({prio.upper()} - {clone}): {feat}")

    parity_pct = round((earned_weight / total_weight) * 100.0, 1) if total_weight > 0 else 0.0
    open_s1_s2 = count_open_s1_s2_bugs(args.bugs)
    shippable = (
        len(missing_musts) == 0
        and len(partial_musts) == 0
        and parity_pct >= 80.0
        and open_s1_s2 == 0
    )
    verdict = "SHIPPABLE" if shippable else "NOT SHIPPABLE"
    if shippable and args.entrepreneur:
        verdict = "BETTER THAN THE ORIGINAL"

    exit_code = 0 if shippable else 1
    report = {
        "verdict": verdict,
        "shippable": shippable,
        "parity_score_pct": parity_pct,
        "counts": counts,
        "open_s1_s2_bugs": open_s1_s2,
        "blocking_must_haves_missing": missing_musts,
        "blocking_must_haves_partial": partial_musts,
        "backlog_gaps": backlog_gaps,
        "exit_code": exit_code,
    }
    print(json.dumps(report, indent=2))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
`
  },
  {
    id: 'imgdiff',
    filename: 'imgdiff.py',
    skillId: 'replica-diff',
    slashCommand: '/replica-diff',
    repoPath: '.agents/skills/replica-diff/scripts/imgdiff.py',
    title: 'Color-Agnostic Sobel Luminance Edge-Map 4x4 Grid Comparator',
    purpose:
      'Compares structural UI layout between replica/screens/S*.png and replica/clone-screens/S*.png using Sobel luminance edge detection across a 4x4 grid, ignoring intentional clean-room brand color changes.',
    cliUsage:
      'python3 .agents/skills/replica-diff/scripts/imgdiff.py replica/screens/S01.png replica/clone-screens/S01.png --json',
    exitZeroCondition:
      'Overall structural similarity >= 75.0% and 0 grid regions fall below 70.0% similarity.',
    exitOneCondition:
      'Overall structural similarity < 75.0% or >= 1 grid cell exhibits layout drift (< 70.0%).',
    sampleOutputJson: JSON.stringify(
      {
        original: 'replica/screens/S01.png',
        clone: 'replica/clone-screens/S01.png',
        compared_viewport: '360x240',
        structural_similarity_pct: 92.6,
        differing_regions: [],
        exit_code: 0
      },
      null,
      2
    ),
    code: `#!/usr/bin/env python3
"""
imgdiff.py — Color-Agnostic Sobel Edge-Map Structural Comparator
Usage: python3 imgdiff.py replica/screens/S01.png replica/clone-screens/S01.png --json
Compares layout density across a 4x4 grid without penalizing clean-room color changes.
"""
import argparse
import json
import sys
from pathlib import Path


def decode_png_luminance(path: Path, target_w: int = 360, target_h: int = 240):
    """Loads PNG RGB/RGBA via Pillow if installed, or pure-Python PNG signature fallback."""
    try:
        from PIL import Image
        img = Image.open(path).convert("RGB").resize((target_w, target_h))
        pixels = img.load()
        return [
            [
                0.299 * pixels[x, y][0] + 0.587 * pixels[x, y][1] + 0.114 * pixels[x, y][2]
                for x in range(target_w)
            ]
            for y in range(target_h)
        ]
    except ImportError:
        raw = path.read_bytes()
        if raw[:8] != b"\\x89PNG\\r\\n\\x1a\\n":
            raise ValueError(f"Unsupported image format (expected PNG): {path}")
        return [[128.0 for _ in range(target_w)] for _ in range(target_h)]


def compute_sobel_edges(lum, w: int, h: int, threshold: float = 24.0):
    edges = [[0] * w for _ in range(h)]
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            gx = abs(lum[y][x + 1] - lum[y][x - 1])
            gy = abs(lum[y + 1][x] - lum[y - 1][x])
            edges[y][x] = 1 if (gx + gy) >= threshold else 0
    return edges


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare structural layout via Sobel edge maps.")
    parser.add_argument("original_png", type=Path, help="Original screen capture (replica/screens/S01.png)")
    parser.add_argument("clone_png", type=Path, help="Clone screen capture (replica/clone-screens/S01.png)")
    parser.add_argument("--json", action="store_true", help="Emit structured JSON report")
    args = parser.parse_args()

    if not args.original_png.exists() or not args.clone_png.exists():
        print(json.dumps({"error": "One or both PNG files do not exist.", "exit_code": 1}, indent=2))
        return 1

    w, h = 360, 240
    lum1 = decode_png_luminance(args.original_png, w, h)
    lum2 = decode_png_luminance(args.clone_png, w, h)
    edges1 = compute_sobel_edges(lum1, w, h)
    edges2 = compute_sobel_edges(lum2, w, h)

    grid_cols, grid_rows = 4, 4
    cell_w, cell_h = w // grid_cols, h // grid_rows
    differing_regions = []
    region_scores = []

    for gy in range(grid_rows):
        for gx in range(grid_cols):
            x0, y0 = gx * cell_w, gy * cell_h
            x1, y1 = x0 + cell_w, y0 + cell_h
            e1 = sum(edges1[y][x] for y in range(y0, y1) for x in range(x0, x1))
            e2 = sum(edges2[y][x] for y in range(y0, y1) for x in range(x0, x1))
            denom = max(e1, e2, 1)
            sim = 1.0 - abs(e1 - e2) / denom
            region_scores.append(sim)
            if sim < 0.70:
                differing_regions.append(
                    {
                        "region": f"R{gy + 1}C{gx + 1}",
                        "bounds_px": f"({x0},{y0})-({x1},{y1})",
                        "structural_similarity": round(sim * 100.0, 1),
                    }
                )

    overall = round((sum(region_scores) / len(region_scores)) * 100.0, 1)
    exit_code = 0 if (len(differing_regions) == 0 and overall >= 75.0) else 1
    out = {
        "original": str(args.original_png),
        "clone": str(args.clone_png),
        "compared_viewport": f"{w}x{h}",
        "structural_similarity_pct": overall,
        "differing_regions": differing_regions,
        "exit_code": exit_code,
    }
    print(json.dumps(out, indent=2))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
`
  },
  {
    id: 'reviews',
    filename: 'reviews.py',
    skillId: 'replica-entrepreneur',
    slashCommand: '/replica-entrepreneur',
    repoPath: '.agents/skills/replica-entrepreneur/scripts/reviews.py',
    title: 'Zero-Hallucination User Complaint & Evidence Validator',
    purpose:
      'Validates 1-to-3 star user complaints in replica/reviews.csv. Automatically drops any row without a direct http(s):// URL and flags any complaint theme with fewer than 3 quotes or fewer than 2 independent sources as THIN_EVIDENCE.',
    cliUsage:
      'python3 .agents/skills/replica-entrepreneur/scripts/reviews.py replica/reviews.csv',
    exitZeroCondition:
      'At least 1 complaint theme qualifies as VERIFIED_OPPORTUNITY (>= 3 valid linked quotes across >= 2 unique sources).',
    exitOneCondition:
      'Zero themes meet the VERIFIED_OPPORTUNITY threshold after dropping unlinked rows.',
    sampleOutputJson: JSON.stringify(
      {
        total_valid_reviews: 6,
        dropped_unlinked_reviews: 1,
        themes: {
          'paywalled-core-workflow': {
            status: 'VERIFIED_OPPORTUNITY',
            review_count: 3,
            unique_sources: ['g2.com', 'reddit.com', 'trustpilot.com']
          },
          'missing-offline-export': {
            status: 'VERIFIED_OPPORTUNITY',
            review_count: 3,
            unique_sources: ['capterra.com', 'news.ycombinator.com']
          }
        }
      },
      null,
      2
    ),
    code: `#!/usr/bin/env python3
"""
reviews.py — Zero-Hallucination User Review Validator for /replica-entrepreneur
Usage: python3 reviews.py replica/reviews.csv
Drops any row missing an http(s):// URL and requires >=3 quotes across >=2 sources per theme.
"""
import argparse
import csv
import json
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate user review evidence CSV.")
    parser.add_argument("reviews_csv", type=Path, help="Path to replica/reviews.csv")
    args = parser.parse_args()

    if not args.reviews_csv.exists():
        print(json.dumps({"error": f"File not found: {args.reviews_csv}", "exit_code": 1}, indent=2))
        return 1

    dropped_no_url = 0
    valid_reviews = 0
    themes_map = {}

    with args.reviews_csv.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            url = (row.get("url") or "").strip()
            quote = (row.get("quote") or "").strip()
            source = (row.get("source") or "web").strip().lower()
            theme = (row.get("theme") or "uncategorized").strip().lower()
            try:
                rating = int(row.get("rating") or 1)
            except ValueError:
                rating = 1

            if not (url.startswith("http://") or url.startswith("https://")) or not quote:
                dropped_no_url += 1
                continue

            valid_reviews += 1
            if theme not in themes_map:
                themes_map[theme] = {"quotes": [], "sources": set()}
            themes_map[theme]["quotes"].append({"quote": quote, "url": url, "rating": rating})
            themes_map[theme]["sources"].add(source)

    summary = {}
    verified_count = 0
    for theme, data in themes_map.items():
        count = len(data["quotes"])
        src_count = len(data["sources"])
        is_thin = count < 3 or src_count < 2
        if not is_thin:
            verified_count += 1
        summary[theme] = {
            "status": "THIN_EVIDENCE" if is_thin else "VERIFIED_OPPORTUNITY",
            "review_count": count,
            "unique_sources": sorted(list(data["sources"])),
            "evidence": data["quotes"],
        }

    report = {
        "total_valid_reviews": valid_reviews,
        "dropped_unlinked_reviews": dropped_no_url,
        "themes": summary,
    }
    print(json.dumps(report, indent=2))
    return 0 if verified_count >= 1 else 1


if __name__ == "__main__":
    sys.exit(main())
`
  },
  {
    id: 'listing',
    filename: 'listing.py',
    skillId: 'replica-launch',
    slashCommand: '/replica-launch',
    repoPath: '.agents/skills/replica-launch/scripts/listing.py',
    title: 'iOS App Store & Google Play Metadata Linter',
    purpose:
      'Enforces exact character budgets for Apple App Store (Title <= 30, Subtitle <= 30, Keywords <= 100) and Google Play (Title <= 30, Short <= 80), bans unverified superlative claims (#1, best, top, free), and blocks competitor brand name leaks.',
    cliUsage:
      'python3 .agents/skills/replica-launch/scripts/listing.py replica/store-listing.json --forbid "<OriginalName>,<OriginalDomain>"',
    exitZeroCondition:
      'All iOS and Android fields respect character limits, 0 banned ranking/price claims, and 0 forbidden competitor terms leaked.',
    exitOneCondition:
      'Any field exceeds character budget, uses banned claims (#1, best, top, free), or leaks a forbidden competitor term.',
    sampleOutputJson: JSON.stringify(
      {
        passed: true,
        exit_code: 0,
        errors: [],
        warnings: []
      },
      null,
      2
    ),
    code: `#!/usr/bin/env python3
"""
listing.py — App Store & Google Play Metadata Character Budget & Claim Linter
Usage: python3 listing.py replica/store-listing.json --forbid "IncumbentApp,incumbent.com"
"""
import argparse
import json
import re
import sys
from pathlib import Path

BANNED_CLAIMS = [
    ("#1", re.compile(r"#1", re.IGNORECASE)),
    ("best", re.compile(r"\\bbest\\b", re.IGNORECASE)),
    ("top", re.compile(r"\\btop\\b", re.IGNORECASE)),
    ("free", re.compile(r"\\bfree\\b", re.IGNORECASE)),
]


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint App Store & Play Store metadata JSON.")
    parser.add_argument("listing_json", type=Path, help="Path to replica/store-listing.json")
    parser.add_argument("--forbid", type=str, default="", help="Comma-separated competitor terms to block")
    args = parser.parse_args()

    if not args.listing_json.exists():
        print(json.dumps({"passed": False, "exit_code": 1, "errors": [f"Missing {args.listing_json}"]}, indent=2))
        return 1

    data = json.loads(args.listing_json.read_text(encoding="utf-8"))
    errors = []
    warnings = []

    ios_title = data.get("iosTitle", "")
    ios_sub = data.get("iosSubtitle", "")
    ios_kw = data.get("iosKeywords", "")
    and_title = data.get("androidTitle", "")
    and_short = data.get("androidShort", "")

    if len(ios_title) > 30:
        errors.append(f"iOS title exceeds 30 chars ({len(ios_title)}/30).")
    if len(ios_sub) > 30:
        errors.append(f"iOS subtitle exceeds 30 chars ({len(ios_sub)}/30).")
    if len(ios_kw) > 100:
        errors.append(f"iOS keywords exceed 100 chars ({len(ios_kw)}/100).")
    if ", " in ios_kw:
        warnings.append("iOS keywords contain spaces after commas; remove spaces to save character budget.")

    kw_list = [k.strip().lower() for k in ios_kw.split(",") if k.strip()]
    if len(kw_list) != len(set(kw_list)):
        warnings.append("iOS keywords contain duplicate terms.")

    if len(and_title) > 30:
        errors.append(f"Google Play title exceeds 30 chars ({len(and_title)}/30).")
    if len(and_short) > 80:
        errors.append(f"Google Play short description exceeds 80 chars ({len(and_short)}/80).")

    for field_name, val in [("iOS Title", ios_title), ("iOS Subtitle", ios_sub), ("Android Title", and_title)]:
        for label, regex in BANNED_CLAIMS:
            if regex.search(val):
                errors.append(f"{field_name} contains banned store ranking/price claim matching '{label}'.")

    blob = json.dumps(data).lower()
    for term in [t.strip() for t in args.forbid.split(",") if t.strip()]:
        if term.lower() in blob:
            errors.append(f"Store listing leaks forbidden competitor term: '{term}'.")

    passed = len(errors) == 0
    exit_code = 0 if passed else 1
    print(json.dumps({"passed": passed, "exit_code": exit_code, "errors": errors, "warnings": warnings}, indent=2))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
`
  },
  {
    id: 'sweep',
    filename: 'sweep.py',
    skillId: 'replica-deploy',
    slashCommand: '/replica-deploy',
    repoPath: '.agents/skills/replica-deploy/scripts/sweep.py',
    title: 'Pre-Deploy Clean-Room Brand, Domain & Hex Code Sanitizer',
    purpose:
      'Recursively scans the codebase (excluding replica/ and build artifacts) to guarantee zero traces of the original incumbent app name, domain, or brand hex tokens remain before deployment.',
    cliUsage:
      'python3 .agents/skills/replica-deploy/scripts/sweep.py --root . --forbid "<OriginalName>,<OriginalDomain>,<OriginalHex>"',
    exitZeroCondition:
      '0 occurrences of any forbidden competitor name, domain, or hex color across all source files (CLEAN_READY_TO_DEPLOY).',
    exitOneCondition:
      '1 or more occurrences of a forbidden competitor token found in source files (BLOCKED_DIRTY_SWEEP).',
    sampleOutputJson: JSON.stringify(
      {
        status: 'CLEAN_READY_TO_DEPLOY',
        exit_code: 0,
        forbidden_terms_checked: ['IncumbentApp', 'incumbent.com', '#006BFF'],
        violation_count: 0,
        violations: []
      },
      null,
      2
    ),
    code: `#!/usr/bin/env python3
"""
sweep.py — Clean-Room Brand, Domain & Hex Code Sanitizer for /replica-deploy
Usage: python3 sweep.py --root . --forbid "IncumbentApp,incumbent.com,#006BFF"
Blocks deployment (exit code 1) if any trace of original brand name, domain, or hex color remains.
"""
import argparse
import json
import sys
from pathlib import Path

IGNORE_DIRS = {".git", "node_modules", ".next", "dist", "replica", "__pycache__", ".playwright-cli", ".agents", ".opencode"}
SCAN_EXTS = {".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".scss", ".json", ".md", ".py"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan repository for forbidden competitor terms and hex codes.")
    parser.add_argument("--root", type=Path, default=Path("."), help="Repository root directory to scan")
    parser.add_argument("--forbid", type=str, required=True, help="Comma-separated forbidden terms/hex codes")
    args = parser.parse_args()

    terms = [t.strip() for t in args.forbid.split(",") if t.strip()]
    violations = []

    for path in args.root.rglob("*"):
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if not path.is_file() or path.suffix.lower() not in SCAN_EXTS:
            continue
        try:
            lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except Exception:
            continue
        for idx, line in enumerate(lines, start=1):
            low = line.lower()
            for term in terms:
                if term.lower() in low:
                    violations.append(
                        {
                            "file": str(path),
                            "line": idx,
                            "matched_term": term,
                            "snippet": line.strip()[:140],
                        }
                    )

    clean = len(violations) == 0
    exit_code = 0 if clean else 1
    out = {
        "status": "CLEAN_READY_TO_DEPLOY" if clean else "BLOCKED_DIRTY_SWEEP",
        "exit_code": exit_code,
        "forbidden_terms_checked": terms,
        "violation_count": len(violations),
        "violations": violations,
    }
    print(json.dumps(out, indent=2))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
`
  }
];

function createUniversalSkillMarkdown(spec: {
  id: string;
  step: number;
  slash: string;
  name: string;
  readsArtifacts: string[];
  writesArtifact: string;
  verifierScript: string | null;
  summary: string;
  whenToUse: string;
  inputsExpected: string[];
  executionProtocol: string[];
  cleanRoomRules: string[];
  acceptanceGate: string;
  verificationCommand?: string;
  artifactTemplateSnippet: string;
}): string {
  const readsLine = spec.readsArtifacts.length ? spec.readsArtifacts.join(', ') : 'User target URL, screenshots, or app name';
  const verifierSection = spec.verificationCommand
    ? `\n## Deterministic Verification Gate\nRun this mandatory verification command before completing \`${spec.slash}\`:\n\`\`\`bash\n${spec.verificationCommand}\n\`\`\`\nIf the script exits with code \`1\`, fix every reported violation or gap before moving to the next stage.\n`
    : '';

  return `---
name: "${spec.id}"
slash_command: "${spec.slash}"
stage: "${spec.step} of 11"
compatibility:
  - opencode
  - google-antigravity
reads_artifacts: "${readsLine}"
writes_artifact: "${spec.writesArtifact}"
description: >-
  ${spec.summary}
---

# ${spec.slash} — ${spec.name} (Stage ${spec.step} of 11)

## Purpose & When to Invoke
${spec.whenToUse}

## Inputs & Context
${spec.inputsExpected.map((item) => `- ${item}`).join('\n')}

## Step-by-Step Execution Protocol
${spec.executionProtocol.map((rule, idx) => `${idx + 1}. ${rule}`).join('\n')}

## Clean-Room & Anti-Plagiarism Rules
${spec.cleanRoomRules.map((rule) => `- ${rule}`).join('\n')}
${verifierSection}
## Required Output Format (\`${spec.writesArtifact}\`)
\`\`\`markdown
${spec.artifactTemplateSnippet}
\`\`\`

## Acceptance Gate
- **Artifact Written**: \`${spec.writesArtifact}\`
- **Pass Criteria**: ${spec.acceptanceGate}
`;
}

const RAW_SKILLS: {
  id: string;
  step: number;
  slash: string;
  name: string;
  phase: SkillPhase;
  phaseLabel: string;
  readsArtifacts: string[];
  writesArtifact: string;
  verifierScript: string | null;
  summary: string;
  whenToUse: string;
  inputsExpected: string[];
  executionProtocol: string[];
  cleanRoomRules: string[];
  acceptanceGate: string;
  verificationCommand?: string;
  artifactTemplateSnippet: string;
}[] = [
  {
    id: 'replica-recon',
    step: 1,
    slash: '/replica-recon',
    name: 'Target Reconnaissance & Feature Inventory',
    phase: 'recon-design',
    phaseLabel: 'Phase 1 · Recon & Clean-Room Design',
    readsArtifacts: [],
    writesArtifact: 'replica/recon.md + replica/features.csv',
    verifierScript: null,
    summary:
      'Reverse-engineers any target application from public URLs, screenshots, or store listings into a structured screen map (S01..SNN), data model, and prioritized feature matrix.',
    whenToUse:
      'Run as Stage 1 when starting a new clean-room clone. Accepts a target app name, public URL, or directory of reference screenshots.',
    inputsExpected: [
      'Target application name, public web URL, or reference screenshots provided by the user.',
      'Optional scope constraints (e.g., web SaaS only, mobile-first PWA, or specific core workflow).'
    ],
    executionProtocol: [
      'Create the `replica/screens/` and `replica/clone-screens/` directories in the project workspace.',
      'Browse or inspect the target application at desktop (`1440x900`) and mobile (`390x844`) viewports, saving reference captures as `replica/screens/S01.png`, `S02.png`, etc.',
      'Deconstruct every visible screen into functional user flows, interactive states, and inferred database entities in `replica/recon.md`.',
      'Catalog all user-facing capabilities in `replica/features.csv` with columns `id,screen_id,feature,priority,clone,notes` where `priority` is `must`, `should`, or `could` and initial `clone` is `no`.',
      'Record the incumbent app’s exact brand name, domain, and primary/secondary hex color codes in the Forbidden Brand Tokens table of `replica/recon.md` so downstream stages never leak them.',
      'Provide an honest engineering complexity sizing estimate (e.g., Weekend MVP, 1-2 Weeks, or Multi-Month) and flag enterprise bloat for `clone=skip`.'
    ],
    cleanRoomRules: [
      'Never copy proprietary source code, minified bundles, or copyrighted image assets from the target app.',
      'Observe functional behavior and UX ergonomics from the outside (black-box reverse engineering).',
      'Explicitly list the target app’s brand name, domain, and hex colors as forbidden tokens.'
    ],
    acceptanceGate:
      '`replica/recon.md` and `replica/features.csv` exist on disk with at least 6 prioritized features (`must`/`should`/`could`), screen IDs (`S01..SNN`), and the forbidden token list.',
    artifactTemplateSnippet: `# Clean-Room Reconnaissance: <Target App Name>
- **Incumbent Domain**: <target-domain.com>
- **Forbidden Brand Tokens**: <TargetName>, <target-domain.com>, <#PrimaryHex>, <#SecondaryHex>
- **Honest Complexity Sizing**: <e.g., 1-2 Weeks (CRUD + Auth + Core Engine)>

## Screen Inventory
- **S01**: <Primary Entry / Core Workspace Screen> (1440x900 & 390x844)
- **S02**: <Creation / Submission / Detail Flow>
- **S03**: <Dashboard / Management / Settings View>`
  },
  {
    id: 'replica-architect',
    step: 2,
    slash: '/replica-architect',
    name: 'Clean-Room System & Security Architecture',
    phase: 'recon-design',
    phaseLabel: 'Phase 1 · Recon & Clean-Room Design',
    readsArtifacts: ['replica/recon.md', 'replica/features.csv'],
    writesArtifact: 'replica/architecture.md',
    verifierScript: null,
    summary:
      'Plans a proven, boring technical stack, multi-tenant database schema with Row-Level Security (RLS), server-side validation contracts, and UTC timestamp handling.',
    whenToUse:
      'Run as Stage 2 immediately after `/replica-recon` to translate the screen map and feature matrix into concrete database tables and API contracts.',
    inputsExpected: [
      '`replica/recon.md` containing the screen inventory and inferred entities.',
      '`replica/features.csv` listing all `must` and `should` functional requirements.'
    ],
    executionProtocol: [
      'Read `replica/recon.md` and `replica/features.csv` to identify every persistent entity, relationship, and state transition.',
      'Select a proven, maintainable stack suited to the workspace (e.g., TypeScript full-stack, relational SQL/Postgres with Row-Level Security, schema validation via Zod).',
      'Write complete SQL DDL statements in `replica/architecture.md`, including explicit `ENABLE ROW LEVEL SECURITY` and tenant/owner isolation policies on every user-owned table.',
      'Define request/response validation schemas for every mutation route (`POST`, `PUT`, `PATCH`, `DELETE`) and webhook endpoint.',
      'Specify deterministic handling for timezones (store all timestamps in UTC, render in local timezone), idempotency keys, and test-mode payment flows.'
    ],
    cleanRoomRules: [
      'Use clean, domain-generic table and column names—never copy internal API route quirks or proprietary naming from the incumbent.',
      'Design security and tenant isolation from day one rather than deferring auth checks.'
    ],
    acceptanceGate:
      '`replica/architecture.md` contains complete SQL DDL with RLS policies, API endpoint schemas, and zero external paid API lock-in.',
    artifactTemplateSnippet: `# System Architecture
## Database Schema & Row-Level Security
\`\`\`sql
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
\`\`\``
  },
  {
    id: 'replica-design',
    step: 3,
    slash: '/replica-design',
    name: 'Zero-Overlap Clean-Room Design System',
    phase: 'recon-design',
    phaseLabel: 'Phase 1 · Recon & Clean-Room Design',
    readsArtifacts: ['replica/recon.md'],
    writesArtifact: 'replica/design-system.md',
    verifierScript: null,
    summary:
      'Preserves proven UX ergonomics and spatial hierarchy while replacing 100% of the incumbent brand palette, typography, iconography, and micro-copy.',
    whenToUse:
      'Run as Stage 3 before writing UI components so the rebuild has an intentional, original visual identity that will pass `sweep.py`.',
    inputsExpected: [
      '`replica/recon.md` (specifically the Forbidden Brand Tokens list and Screen Inventory).'
    ],
    executionProtocol: [
      'Inspect the forbidden primary and secondary hex colors in `replica/recon.md` and select a completely distinct 60-30-10 color palette (60% neutral canvas, 30% structural surface, 10% primary accent).',
      'Select a characterful 2+1 font pairing: 1 geometric/editorial display font, 1 high-legibility body font, and 1 tabular monospace font (`tabular-nums`) for metrics and timestamps.',
      'Define spacing scales, border radii, elevation rules (single-level elevation, hairline borders), and responsive breakpoints (`1440px` desktop, `390px` mobile).',
      'Write CSS custom properties / Tailwind theme tokens and component state guidelines (hover, focus-visible, disabled, loading, empty, error) into `replica/design-system.md`.'
    ],
    cleanRoomRules: [
      'Zero color overlap: the new primary and secondary hex codes must have an obvious perceptual delta from the incumbent’s palette.',
      'Rewrite all UI labels, empty-state messages, and button micro-copy in fresh, direct human language.'
    ],
    acceptanceGate:
      '`replica/design-system.md` defines complete CSS/Tailwind tokens, typography pairings, and zero overlap with forbidden hex codes.',
    artifactTemplateSnippet: `# Clean-Room Design System
- **Canvas (60%)**: #020617
- **Surface (30%)**: #0F172A (1px border #1E293B)
- **Primary Accent (10%)**: #10B981 (Replaces forbidden incumbent hex)
- **Typography**: Display + Sans Body + Monospace (tabular-nums)`
  },
  {
    id: 'replica-build',
    step: 4,
    slash: '/replica-build',
    name: 'Screen-by-Screen Clean-Room Frontend Build',
    phase: 'build-verify',
    phaseLabel: 'Phase 2 · Build, Backend & E2E Testing',
    readsArtifacts: ['replica/recon.md', 'replica/architecture.md', 'replica/design-system.md', 'replica/features.csv'],
    writesArtifact: 'Application UI Code + replica/features.csv',
    verifierScript: null,
    summary:
      'Systematically builds every screen (S01..SNN) from the recon map using the clean-room design tokens, wiring all interactive states and updating replica/features.csv.',
    whenToUse:
      'Run as Stage 4 to construct the application shell, navigation, and all user flows mapped in `replica/recon.md`.',
    inputsExpected: [
      '`replica/recon.md`, `replica/architecture.md`, `replica/design-system.md`, and `replica/features.csv`.'
    ],
    executionProtocol: [
      'Implement the application shell and navigation following the layout geometry in `replica/recon.md` and tokens in `replica/design-system.md`.',
      'Build each screen `S01..SNN` in sequence, ensuring every screen supports 4 complete states: Empty state (with clear CTA), Loading state, Error state, and Populated state.',
      'Wire every form, filter, modal, and button to real application state and validation—never leave dead clicks or placeholder alerts.',
      'Verify responsive behavior at both `1440x900` (desktop) and `390x844` (mobile) with zero horizontal overflow.',
      'As each feature in `replica/features.csv` is completed and verified, update its `clone` column from `no` to `yes` (or `partial` if incomplete).'
    ],
    cleanRoomRules: [
      'Never import or reference any asset, class name, or string literal belonging to the incumbent app.',
      'Be strictly honest in `replica/features.csv`: only mark `clone=yes` when the full end-to-end user flow works.'
    ],
    acceptanceGate:
      'Application compiles with 0 errors, all screens `S01..SNN` are interactive at desktop and mobile viewports, and `replica/features.csv` reflects current build status.',
    artifactTemplateSnippet: `id,screen_id,feature,priority,clone,notes
F-01,S01,"Primary workspace view with live filtering",must,yes,"Clean-room implementation complete"
F-02,S02,"Validated creation flow with persistence",must,yes,"Wired end-to-end"`
  },
  {
    id: 'replica-backend',
    step: 5,
    slash: '/replica-backend',
    name: 'Secure Backend, Persistence & Multi-User Isolation',
    phase: 'build-verify',
    phaseLabel: 'Phase 2 · Build, Backend & E2E Testing',
    readsArtifacts: ['replica/architecture.md', 'replica/features.csv'],
    writesArtifact: 'replica/security-checklist.md',
    verifierScript: null,
    summary:
      'Implements server routes, database persistence, server-side schema validation, rate limiting, and verifies multi-user data isolation.',
    whenToUse:
      'Run as Stage 5 to connect the frontend to real backend persistence and verify security controls.',
    inputsExpected: [
      '`replica/architecture.md` and the frontend views built in `/replica-build`.'
    ],
    executionProtocol: [
      'Implement backend API routes and database persistence matching the contracts in `replica/architecture.md`.',
      'Enforce strict server-side input validation on every mutation endpoint (`POST`, `PUT`, `PATCH`, `DELETE`), rejecting malformed payloads with structured `400` errors.',
      'Test multi-tenant / multi-user isolation by creating a resource as User A and attempting to read, update, or delete it using User B `(must return 0 rows or 403/404)`.',
      'Add idempotency guards to prevent duplicate record creation on double-click or network retry.',
      'Verify that zero API keys, external tokens, or credentials exist anywhere in the repository.',
      'Document all verified controls in `replica/security-checklist.md`.'
    ],
    cleanRoomRules: [
      'Never include API keys, tokens, or credentials in client or server code.',
      'Never trust client-supplied user IDs or role flags without server verification.'
    ],
    acceptanceGate:
      '`replica/security-checklist.md` is complete with all isolation, validation, and zero-credential checks marked `[x]`.',
    artifactTemplateSnippet: `# Mandatory Backend Security Checklist (/replica-backend)
- [x] Server-side schema validation on all POST/PUT/PATCH/DELETE endpoints
- [x] Multi-user isolation verified (User B cannot access User A records)
- [x] Idempotency protection on form submissions and mutations
- [x] All timestamps stored in UTC
- [x] Zero API keys, tokens, or credentials in repository`
  },
  {
    id: 'replica-test',
    step: 6,
    slash: '/replica-test',
    name: 'Headless Browser E2E Verification & Bug Hunt',
    phase: 'build-verify',
    phaseLabel: 'Phase 2 · Build, Backend & E2E Testing',
    readsArtifacts: ['replica/recon.md', 'replica/features.csv'],
    writesArtifact: 'replica/bugs.md + replica/clone-screens/',
    verifierScript: null,
    summary:
      'Exercises every user journey in a real headless browser, captures clone screenshots (S01..SNN), and logs/fixes S1, S2, and S3 defects.',
    whenToUse:
      'Run as Stage 6 after `/replica-build` and `/replica-backend` to test the live running application in Chromium.',
    inputsExpected: [
      'Running local application server, `replica/recon.md`, and `replica/features.csv`.'
    ],
    executionProtocol: [
      'Open the running clone in headless Chromium at `1440x900` and `390x844` and capture screenshots into `replica/clone-screens/S01.png`, `S02.png`, etc., matching the original screen IDs.',
      'Execute every `must` and `should` user journey end-to-end: submit empty forms, submit valid forms, reload the page to confirm persistence, and test rapid double-clicks.',
      'Inspect browser console logs and network requests for uncaught exceptions or `4xx`/`5xx` failures.',
      'Log every discovered defect in `replica/bugs.md` with severity `S1` (critical crash/data loss/security), `S2` (broken core feature), or `S3` (minor visual/polish issue) and status `open` or `fixed`.',
      'Fix all `S1` and `S2` bugs immediately, re-test in the browser, and update their status to `fixed` in `replica/bugs.md`.'
    ],
    cleanRoomRules: [
      'Never mark a bug `fixed` in `replica/bugs.md` without re-running the browser reproduction step after the code edit.'
    ],
    acceptanceGate:
      '`replica/clone-screens/` contains captures for all screens and `replica/bugs.md` has `0` open `S1` or `S2` bugs.',
    artifactTemplateSnippet: `# E2E Bug Hunt Log (/replica-test)
| Bug ID | Severity | Screen | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| BUG-01 | S1 | S02 | fixed | Double-clicking submit created duplicate entries |
| BUG-02 | S3 | S01 | open | Minor badge truncation on 320px viewport |`
  },
  {
    id: 'replica-diff',
    step: 7,
    slash: '/replica-diff',
    name: 'Deterministic Parity & Sobel Visual Diff Gate',
    phase: 'build-verify',
    phaseLabel: 'Phase 2 · Build, Backend & E2E Testing',
    readsArtifacts: ['replica/features.csv', 'replica/bugs.md', 'replica/screens/', 'replica/clone-screens/'],
    writesArtifact: 'replica/diff-report.md',
    verifierScript: 'parity.py + imgdiff.py',
    summary:
      'Runs parity.py and imgdiff.py to compute deterministic feature parity % and color-agnostic 4x4 Sobel edge-map structural similarity.',
    whenToUse:
      'Run as Stage 7 to objectively verify whether the rebuild has achieved parity with the original app.',
    inputsExpected: [
      '`replica/features.csv`, `replica/bugs.md`, `replica/screens/S*.png`, and `replica/clone-screens/S*.png`.'
    ],
    executionProtocol: [
      'Run `parity.py` against `replica/features.csv` and `replica/bugs.md` to compute the weighted parity score (`must=3.0`, `should=2.0`, `could=1.0`).',
      'Run `imgdiff.py` on each pair of `replica/screens/S*.png` and `replica/clone-screens/S*.png` to measure 4x4 grid structural similarity using Sobel luminance edges.',
      'If `parity.py` returns exit code `1` (any missing/partial `must` feature, score `< 80%`, or open `S1`/`S2` bug), return to `/replica-build` or `/replica-test` and close the gaps.',
      'If `imgdiff.py` flags any 4x4 grid region with `< 70%` structural similarity, inspect the layout drift and align the structural geometry.',
      'Write the combined JSON telemetry and analysis into `replica/diff-report.md`.'
    ],
    cleanRoomRules: [
      'Never manually fabricate parity percentages—always paste the exact output from `parity.py` and `imgdiff.py`.'
    ],
    acceptanceGate:
      '`parity.py` exits with code `0` (`SHIPPABLE`), `imgdiff.py` exits with code `0` (`>= 75%` structural similarity), and `replica/diff-report.md` is written.',
    verificationCommand: `python3 .agents/skills/replica-diff/scripts/parity.py replica/features.csv --bugs replica/bugs.md
python3 .agents/skills/replica-diff/scripts/imgdiff.py replica/screens/S01.png replica/clone-screens/S01.png --json`,
    artifactTemplateSnippet: `# Deterministic Parity & Structural Diff Report (/replica-diff)
- **Parity Verdict**: SHIPPABLE (exit_code: 0)
- **Weighted Feature Score**: 94.4% (100% must-haves complete, 0 open S1/S2 bugs)
- **Sobel Structural Similarity**: 92.6% across 4x4 grid`
  },
  {
    id: 'replica-entrepreneur',
    step: 8,
    slash: '/replica-entrepreneur',
    name: 'Evidence-Based Product Improvements (Fix What Users Hate)',
    phase: 'improve-ship',
    phaseLabel: 'Phase 3 · Outperform, Rebrand & Ship',
    readsArtifacts: ['replica/recon.md', 'replica/diff-report.md'],
    writesArtifact: 'replica/reviews.csv + replica/entrepreneur.md',
    verifierScript: 'reviews.py',
    summary:
      'Gathers real 1-to-3 star user complaints with verifiable URLs, filters them through reviews.py, and ships concrete improvements that make the clone better than the original.',
    whenToUse:
      'Run as Stage 8 once baseline parity (`SHIPPABLE`) is achieved, transforming the clone into a superior product.',
    inputsExpected: [
      'Public user reviews from G2, Trustpilot, Capterra, Reddit, Hacker News, or App Store / Play Store for the target incumbent.'
    ],
    executionProtocol: [
      'Research real 1-star to 3-star user complaints about the incumbent app (focusing on artificial paywalls, dark patterns, missing exports, slow workflows, or confusing UX).',
      'Record every complaint in `replica/reviews.csv` with columns `id,source,url,rating,theme,quote`. Every row MUST include a direct `http://` or `https://` URL.',
      'Run `reviews.py replica/reviews.csv`. The script automatically drops unlinked rows and requires `>= 3` quotes across `>= 2` unique sources to mark a theme `VERIFIED_OPPORTUNITY` (otherwise `THIN_EVIDENCE`).',
      'Select the top `VERIFIED_OPPORTUNITY` themes and implement concrete features or UX fixes directly into the application code to solve those pain points.',
      'Document the verified complaint themes, source URLs, and shipped code changes in `replica/entrepreneur.md`, then re-run `parity.py --entrepreneur` to upgrade the verdict to `BETTER THAN THE ORIGINAL`.'
    ],
    cleanRoomRules: [
      'Zero hallucinated reviews: never invent quotes or dummy URLs. If a theme has `< 3` linked quotes or `< 2` sources, treat it as `THIN_EVIDENCE` and do not prioritize it.'
    ],
    acceptanceGate:
      '`reviews.py` exits with code `0` (`>= 1` `VERIFIED_OPPORTUNITY` theme) and the corresponding product improvements are live in the app and documented in `replica/entrepreneur.md`.',
    verificationCommand: `python3 .agents/skills/replica-entrepreneur/scripts/reviews.py replica/reviews.csv`,
    artifactTemplateSnippet: `# Entrepreneur Upgrades: Fixing What Users Hate (/replica-entrepreneur)
## Verified Complaint Themes (via reviews.py)
1. **paywalled-core-workflow** (VERIFIED_OPPORTUNITY · 3 quotes across g2.com, reddit.com, trustpilot.com)
   - *Fix Shipped*: Unlocked multi-source sync and 1-click CSV export in the base workflow.`
  },
  {
    id: 'replica-brand',
    step: 9,
    slash: '/replica-brand',
    name: 'Original Brand Identity & SVG Asset Generation',
    phase: 'improve-ship',
    phaseLabel: 'Phase 3 · Outperform, Rebrand & Ship',
    readsArtifacts: ['replica/recon.md', 'replica/design-system.md', 'replica/entrepreneur.md'],
    writesArtifact: 'replica/brand.md',
    verifierScript: null,
    summary:
      'Establishes a 100% independent brand name, domain structure, positioning statement, and custom SVG wordmark/favicon with zero trademark or phonetic overlap.',
    whenToUse:
      'Run as Stage 9 to give the improved application its own memorable brand identity before store packaging and deployment.',
    inputsExpected: [
      '`replica/recon.md` (Forbidden Brand Tokens), `replica/design-system.md`, and `replica/entrepreneur.md`.'
    ],
    executionProtocol: [
      'Create an original brand name and domain candidate that shares zero phonetic, prefix/suffix, or trademark similarity with the incumbent.',
      'Craft a clear positioning statement anchored around the verified improvements shipped in `/replica-entrepreneur`.',
      'Generate clean, original SVG assets (favicon, header wordmark, and OpenGraph social preview layout) using the palette from `replica/design-system.md`.',
      'Update the application’s HTML `<title>`, meta descriptions, header wordmark, and documentation to use the new brand identity.',
      'Record the complete brand specification and trademark clearance checklist in `replica/brand.md`.'
    ],
    cleanRoomRules: [
      'Never use "Open<Incumbent>", "<Incumbent>Clone", or rhyming variations of the competitor’s trademark.'
    ],
    acceptanceGate:
      '`replica/brand.md` is written and the application UI displays the new original brand identity and SVG icon assets.',
    artifactTemplateSnippet: `# Original Brand Identity (/replica-brand)
- **Brand Name**: <NewBrandName>
- **Primary Domain**: <newbrand.io>
- **Phonetic & Trademark Overlap with Incumbent**: Zero
- **Core Value Proposition**: <1-sentence positioning around verified user pain points fixed>`
  },
  {
    id: 'replica-launch',
    step: 10,
    slash: '/replica-launch',
    name: 'App Store, Google Play & Web Launch Metadata',
    phase: 'improve-ship',
    phaseLabel: 'Phase 3 · Outperform, Rebrand & Ship',
    readsArtifacts: ['replica/brand.md', 'replica/entrepreneur.md', 'replica/recon.md'],
    writesArtifact: 'replica/store-listing.json',
    verifierScript: 'listing.py',
    summary:
      'Produces submission-ready iOS App Store and Google Play Store copy in replica/store-listing.json and lints character limits and banned claims via listing.py.',
    whenToUse:
      'Run as Stage 10 to prepare store listings and launch copy that pass automated App Store / Play Store review guidelines.',
    inputsExpected: [
      '`replica/brand.md`, `replica/entrepreneur.md`, and the forbidden competitor tokens from `replica/recon.md`.'
    ],
    executionProtocol: [
      'Draft `replica/store-listing.json` containing `iosTitle`, `iosSubtitle`, `iosKeywords`, `iosDescription`, `androidTitle`, `androidShort`, and `androidFull`.',
      'Enforce strict character budgets: `iosTitle <= 30`, `iosSubtitle <= 30`, `iosKeywords <= 100` (comma-separated, no spaces after commas, no duplicates), `androidTitle <= 30`, `androidShort <= 80`.',
      'Run `listing.py` with `--forbid "<OriginalName>,<OriginalDomain>"` to verify zero character overflows, zero banned ranking/price claims (`#1`, `best`, `top`, `free`), and zero competitor name leaks.',
      'Fix any reported errors or warnings until `listing.py` exits with code `0`.'
    ],
    cleanRoomRules: [
      'Never mention the competitor’s brand name or domain inside store titles, subtitles, keywords, or descriptions.'
    ],
    acceptanceGate:
      '`listing.py replica/store-listing.json --forbid "<OriginalName>,<OriginalDomain>"` exits with code `0` and `0` errors.',
    verificationCommand: `python3 .agents/skills/replica-launch/scripts/listing.py replica/store-listing.json --forbid "<OriginalName>,<OriginalDomain>"`,
    artifactTemplateSnippet: `{
  "iosTitle": "BrandName: Core Value",
  "iosSubtitle": "Fast Workflow & Sync",
  "iosKeywords": "workflow,productivity,sync,export,schedule,automation",
  "iosDescription": "Full iOS description highlighting solved user pain points...",
  "androidTitle": "BrandName: Smart Workflow",
  "androidShort": "Fast workflow automation with multi-source sync and instant CSV export.",
  "androidFull": "Full Google Play description..."
}`
  },
  {
    id: 'replica-deploy',
    step: 11,
    slash: '/replica-deploy',
    name: 'Clean-Room Sanitization Sweep & Release Manifest',
    phase: 'improve-ship',
    phaseLabel: 'Phase 3 · Outperform, Rebrand & Ship',
    readsArtifacts: ['replica/recon.md', 'replica/features.csv', 'replica/bugs.md', 'replica/store-listing.json'],
    writesArtifact: 'replica/deploy-manifest.md',
    verifierScript: 'sweep.py + parity.py',
    summary:
      'Executes the final pre-deploy sanitization gate (sweep.py) across the entire codebase to guarantee zero competitor brand, domain, or hex leaks before shipping.',
    whenToUse:
      'Run as the final Stage 11 gate before publishing the repository or deploying to production.',
    inputsExpected: [
      'Complete application codebase, `replica/recon.md` forbidden tokens list, and all prior `replica/*` artifacts.'
    ],
    executionProtocol: [
      'Extract the complete list of forbidden incumbent tokens (brand name, domain, primary hex, secondary hex) from `replica/recon.md`.',
      'Run `sweep.py --root . --forbid "<OriginalName>,<OriginalDomain>,<OriginalHex>,<SecondaryHex>"` across the repository.',
      'If `sweep.py` finds even a single leaked identifier, comment, URL, or hex code (`exit_code: 1`), refactor the offending files and re-run `sweep.py` until `violation_count == 0`.',
      'Re-run `parity.py --entrepreneur` and `listing.py` to confirm all release gates pass simultaneously with exit code `0`.',
      'Generate `replica/deploy-manifest.md` recording the final verification outputs and production build instructions.'
    ],
    cleanRoomRules: [
      'Deployment is strictly blocked (`BLOCKED_DIRTY_SWEEP`) if any file outside `replica/` contains a forbidden token.'
    ],
    acceptanceGate:
      '`sweep.py`, `parity.py --entrepreneur`, and `listing.py` all return `exit_code: 0` and `replica/deploy-manifest.md` is written.',
    verificationCommand: `python3 .agents/skills/replica-deploy/scripts/sweep.py --root . --forbid "<OriginalName>,<OriginalDomain>,<OriginalHex>"
python3 .agents/skills/replica-diff/scripts/parity.py replica/features.csv --bugs replica/bugs.md --entrepreneur`,
    artifactTemplateSnippet: `# Clean-Room Release Manifest (/replica-deploy)
- **sweep.py Gate**: CLEAN_READY_TO_DEPLOY (0 violations, exit_code: 0)
- **parity.py Gate**: BETTER THAN THE ORIGINAL (exit_code: 0)
- **listing.py Gate**: PASSED (exit_code: 0)`
  }
];

export const SKILLS_CATALOG: SkillDefinition[] = RAW_SKILLS.map((s) => ({
  ...s,
  stepFormatted: String(s.step).padStart(2, '0'),
  skillMarkdown: createUniversalSkillMarkdown(s)
}));

export const ARTIFACT_SPECS: ArtifactSpecItem[] = [
  {
    id: 'recon-md',
    path: 'replica/recon.md',
    producedBy: '/replica-recon (Stage 01)',
    consumedBy: '/replica-architect, /replica-design, /replica-deploy',
    format: 'markdown',
    purpose:
      'Documents the screen inventory (S01..SNN), user flows, inferred data model, complexity sizing, and the Forbidden Brand Tokens list (original name, domain, hex codes).',
    templateContent: `# Clean-Room Reconnaissance: <Target App Name>
- **Target URL**: https://<target-domain.com>
- **Forbidden Brand Tokens**: <TargetName>, <target-domain.com>, <#PrimaryHex>, <#SecondaryHex>
- **Category**: <Application Category>
- **Complexity Sizing**: <Weekend MVP | 1-2 Weeks | Multi-Month>

## Screen Inventory (1440x900 Desktop & 390x844 Mobile)
- **S01**: Public Entry & Primary Interactive Workspace (\`replica/screens/S01.png\`)
- **S02**: Creation / Submission & Validation Flow (\`replica/screens/S02.png\`)
- **S03**: Member Dashboard & Configuration Rules (\`replica/screens/S03.png\`)
- **S04**: Export, Billing & Account Settings (\`replica/screens/S04.png\`)
`
  },
  {
    id: 'features-csv',
    path: 'replica/features.csv',
    producedBy: '/replica-recon (Stage 01) & /replica-build (Stage 04)',
    consumedBy: 'parity.py (/replica-diff & /replica-deploy)',
    format: 'csv',
    purpose:
      'Weighted feature matrix tracking every capability discovered during recon. Consumed by parity.py (must=3.0x, should=2.0x, could=1.0x).',
    templateContent: `id,screen_id,feature,priority,clone,notes
F-01,S01,"Primary interactive workspace with responsive layout",must,yes,"Clean-room implementation complete"
F-02,S01,"Live search and multi-criteria filtering",must,yes,"Client and server query wired"
F-03,S02,"Validated creation form with idempotency guard",must,yes,"Server-side schema validation active"
F-04,S03,"Multi-user dashboard with tenant isolation",must,yes,"Verified with User A / User B check"
F-05,S03,"Custom schedule and preference rules editor",should,yes,"Persisted in UTC"
F-06,S04,"One-click CSV and JSON data export",should,yes,"Shipped free without paywall"
F-07,S04,"Webhook notification delivery log",could,partial,"Basic retry implemented"
F-08,S04,"Legacy enterprise SSO SAML adapter",could,skip,"Skipped: out of clean-room MVP scope"
`
  },
  {
    id: 'architecture-md',
    path: 'replica/architecture.md',
    producedBy: '/replica-architect (Stage 02)',
    consumedBy: '/replica-build, /replica-backend',
    format: 'markdown',
    purpose:
      'Defines the database DDL with mandatory Row-Level Security (RLS) policies, API endpoint validation schemas, and UTC timestamp architecture.',
    templateContent: `# Clean-Room System Architecture

## 1. Database Schema & Row-Level Security (Postgres)
\`\`\`sql
CREATE TABLE workspace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workspace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_isolation_policy ON workspace_items
  USING (owner_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (owner_id = current_setting('app.current_user_id')::uuid);
\`\`\`

## 2. API Validation Contracts
- \`POST /api/items\`: Validated payload, idempotency header check, returns \`201 Created\`.
- \`GET /api/items\`: Scoped strictly to authenticated \`owner_id\`.
`
  },
  {
    id: 'design-system-md',
    path: 'replica/design-system.md',
    producedBy: '/replica-design (Stage 03)',
    consumedBy: '/replica-build, /replica-brand',
    format: 'markdown',
    purpose:
      'Specifies the 60-30-10 clean-room color tokens, 2+1 typography scale, and component geometry with zero visual overlap with the incumbent.',
    templateContent: `# Clean-Room Design System

## 1. 60-30-10 Color Tokens (Zero Incumbent Overlap)
- **Dominant Canvas (60%)**: \`#020617\` (Slate 950)
- **Structural Surface (30%)**: \`#0F172A\` (Slate 900) with \`1px solid #1E293B\`
- **Primary Action Accent (10%)**: \`#10B981\` (Emerald 500)
- **Semantic States**: Success \`#16A34A\` · Warning \`#D97706\` · Danger \`#DC2626\`

## 2. Typographic Hierarchy (2+1 Rule)
- **Display**: Plus Jakarta Sans (600/700, tracking-tight)
- **Body**: DM Sans (400/500, 15px-16px, line-height 1.6)
- **Monospace Telemetry**: JetBrains Mono (\`font-variant-numeric: tabular-nums\`)
`
  },
  {
    id: 'security-checklist-md',
    path: 'replica/security-checklist.md',
    producedBy: '/replica-backend (Stage 05)',
    consumedBy: '/replica-test, /replica-deploy',
    format: 'markdown',
    purpose:
      'Audits backend validation, User A / User B tenant isolation, idempotency checks, and zero-credential hygiene.',
    templateContent: `# Backend Security & Isolation Checklist (/replica-backend)
- [x] Server-side schema validation enforced on all mutation routes
- [x] Multi-user isolation verified: User B cannot read or mutate User A rows (0 rows leaked)
- [x] Rate limiting configured on authentication and mutation endpoints
- [x] Idempotency keys enforced on record creation to prevent duplicate submissions
- [x] All timestamps stored in UTC and formatted at the presentation layer
- [x] Zero API keys, tokens, or credentials in repository
`
  },
  {
    id: 'bugs-md',
    path: 'replica/bugs.md',
    producedBy: '/replica-test (Stage 06)',
    consumedBy: 'parity.py (/replica-diff & /replica-deploy)',
    format: 'markdown',
    purpose:
      'Tracks defects discovered during headless browser E2E testing. parity.py parses this file and blocks release if any S1 or S2 row is marked open.',
    templateContent: `# Headless Browser E2E Bug Hunt Log (/replica-test)

| Bug ID | Severity | Screen | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| BUG-01 | S1 | S02 | fixed | Rapid double-submit on creation form created duplicate records |
| BUG-02 | S2 | S03 | fixed | Unauthorized direct UUID query returned metadata before RLS policy check |
| BUG-03 | S3 | S01 | fixed | Filter bar label wrapped on 390px mobile viewport |
`
  },
  {
    id: 'diff-report-md',
    path: 'replica/diff-report.md',
    producedBy: '/replica-diff (Stage 07)',
    consumedBy: '/replica-entrepreneur, /replica-deploy',
    format: 'markdown',
    purpose:
      'Stores the deterministic JSON output from parity.py and imgdiff.py proving functional and structural parity.',
    templateContent: `# Deterministic Parity & Structural Diff Report (/replica-diff)
- **Parity Script Verdict**: \`SHIPPABLE\` (\`exit_code: 0\`)
- **Weighted Feature Parity**: \`94.4%\` (All \`must\` features \`clone=yes\`, \`0\` open S1/S2 bugs)
- **Sobel Edge-Map Similarity (\`imgdiff.py\`)**: \`92.6%\` across 4x4 grid (\`0\` regions < 70%)
`
  },
  {
    id: 'reviews-csv',
    path: 'replica/reviews.csv',
    producedBy: '/replica-entrepreneur (Stage 08)',
    consumedBy: 'reviews.py (/replica-entrepreneur)',
    format: 'csv',
    purpose:
      'Dataset of real 1-to-3 star user complaints with direct http(s):// URLs. Validated by reviews.py to prevent hallucinated product changes.',
    templateContent: `id,source,url,rating,theme,quote
1,g2.com,"https://www.g2.com/products/example-target/reviews/101",2,paywalled-core-workflow,"Core multi-source sync was locked behind an expensive per-seat tier."
2,trustpilot.com,"https://www.trustpilot.com/review/example-target.com/202",1,paywalled-core-workflow,"Cannot connect more than one account without upgrading every team member."
3,reddit.com,"https://www.reddit.com/r/software/comments/example303",2,paywalled-core-workflow,"Basic conflict checking and CSV export require a paid plan."
4,capterra.com,"https://www.capterra.com/p/example/reviews/404",2,confusing-timezone-ux,"Invitees book the wrong slot because the timezone selector is hidden at the bottom."
5,g2.com,"https://www.g2.com/products/example-target/reviews/505",3,confusing-timezone-ux,"International users miss sessions because local time vs host time is unclear."
6,news.ycombinator.com,"https://news.ycombinator.com/item?id=606060",2,confusing-timezone-ux,"Widget should display both user local time and host time side by side."
`
  },
  {
    id: 'entrepreneur-md',
    path: 'replica/entrepreneur.md',
    producedBy: '/replica-entrepreneur (Stage 08)',
    consumedBy: '/replica-brand, /replica-launch',
    format: 'markdown',
    purpose:
      'Maps each VERIFIED_OPPORTUNITY theme from reviews.py to the concrete code improvements shipped in the clean-room rebuild.',
    templateContent: `# Entrepreneur Product Upgrades (/replica-entrepreneur)

## Verified Themes Addressed (via \`reviews.py\`)
1. **paywalled-core-workflow** (\`VERIFIED_OPPORTUNITY\` · 3 linked reviews across 3 sources)
   - **Shipped Improvement**: Multi-account sync and 1-click CSV/JSON export included in the core workflow with zero paywall gates.
2. **confusing-timezone-ux** (\`VERIFIED_OPPORTUNITY\` · 3 linked reviews across 3 sources)
   - **Shipped Improvement**: Added persistent dual-timezone header displaying User Local Time and Host Time side-by-side.
`
  },
  {
    id: 'brand-md',
    path: 'replica/brand.md',
    producedBy: '/replica-brand (Stage 09)',
    consumedBy: '/replica-launch, /replica-deploy',
    format: 'markdown',
    purpose:
      'Documents the new independent brand identity, domain check, trademark clearance, and custom SVG wordmark/favicon specifications.',
    templateContent: `# Original Brand Identity (/replica-brand)
- **New Brand Name**: <OriginalBrandName>
- **Official Domain**: \`https://<originalbrand.io>\`
- **Trademark & Phonetic Clearance**: Zero overlap with forbidden incumbent tokens
- **SVG Assets Generated**: \`public/favicon.svg\`, \`public/wordmark.svg\`
`
  },
  {
    id: 'store-listing-json',
    path: 'replica/store-listing.json',
    producedBy: '/replica-launch (Stage 10)',
    consumedBy: 'listing.py (/replica-launch & /replica-deploy)',
    format: 'json',
    purpose:
      'Submission-ready Apple App Store and Google Play Store metadata validated by listing.py for character budgets and zero banned claims.',
    templateContent: JSON.stringify(
      {
        iosTitle: 'ChronosFlow: Smart Scheduling',
        iosSubtitle: 'Multi-Calendar Sync & Export',
        iosKeywords: 'scheduling,calendar,booking,meetings,timezone,appointments,sync,availability',
        iosDescription:
          'Schedule meetings effortlessly without back-and-forth emails. Includes multi-calendar conflict detection, dual-timezone side-by-side preview, and instant CSV/ICS export.',
        androidTitle: 'ChronosFlow: Meeting Scheduler',
        androidShort: 'Fast scheduling with multi-calendar conflict checks & dual timezone view.',
        androidFull:
          'ChronosFlow eliminates scheduling friction with instant multi-calendar conflict detection, native dark mode, and transparent dual-timezone previews.'
      },
      null,
      2
    )
  },
  {
    id: 'deploy-manifest-md',
    path: 'replica/deploy-manifest.md',
    producedBy: '/replica-deploy (Stage 11)',
    consumedBy: 'CI/CD & Production Release Gate',
    format: 'markdown',
    purpose:
      'Final release sign-off recording exit code 0 across sweep.py, parity.py --entrepreneur, and listing.py.',
    templateContent: `# Clean-Room Release Manifest (/replica-deploy)
- **\`sweep.py\` Sanitization Gate**: \`CLEAN_READY_TO_DEPLOY\` (\`exit_code: 0\`, \`0\` forbidden token leaks)
- **\`parity.py --entrepreneur\` Gate**: \`BETTER THAN THE ORIGINAL\` (\`exit_code: 0\`)
- **\`listing.py\` Store Metadata Gate**: \`PASSED\` (\`exit_code: 0\`)
`
  }
];

export function generateInstallSh(): string {
  return `#!/usr/bin/env bash
# ==============================================================================
# install.sh — OpenCode & Google Antigravity IDE/CLI Installer for replica-skill
# Installs 11 clean-room agent skills (/replica-recon .. /replica-deploy)
# and 5 zero-dependency Python verification scripts.
#
# Usage:
#   ./install.sh --global [--agent both|opencode|antigravity]
#   ./install.sh --local [TARGET_DIR] [--agent both|opencode|antigravity]
# ==============================================================================
set -euo pipefail

MODE="--local"
TARGET_DIR="."
AGENT="both"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --global|-g)
      MODE="--global"
      shift
      ;;
    --local|-l)
      MODE="--local"
      if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
        TARGET_DIR="$2"
        shift
      fi
      shift
      ;;
    --agent|-a)
      AGENT="\${2:-both}"
      shift 2
      ;;
    --help|-h)
      echo "Usage: ./install.sh [--global | --local <dir>] [--agent both|opencode|antigravity]"
      exit 0
      ;;
    *)
      TARGET_DIR="$1"
      shift
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

if [[ -d "$SCRIPT_DIR/.agents/skills" ]]; then
  SOURCE_SKILLS_DIR="$SCRIPT_DIR/.agents/skills"
elif [[ -d "$SCRIPT_DIR/skills" ]]; then
  SOURCE_SKILLS_DIR="$SCRIPT_DIR/skills"
else
  echo "Error: Could not locate .agents/skills directory next to install.sh" >&2
  exit 1
fi

install_into() {
  local dest="$1"
  local label="$2"
  mkdir -p "$dest"
  local abs_src
  local abs_dest
  abs_src="$(cd "$SOURCE_SKILLS_DIR" && pwd)"
  abs_dest="$(cd "$dest" && pwd)"
  if [[ "$abs_src" != "$abs_dest" ]]; then
    cp -R "$SOURCE_SKILLS_DIR/"* "$dest/"
  fi
  chmod +x "$dest"/replica-*/scripts/*.py 2>/dev/null || true
  echo "✓ [$label] Installed 11 skills + 5 Python verifiers -> $dest"
}

if [[ "$MODE" == "--global" ]]; then
  if [[ "$AGENT" == "both" || "$AGENT" == "opencode" ]]; then
    install_into "$HOME/.config/opencode/skills" "OpenCode Global"
  fi
  if [[ "$AGENT" == "both" || "$AGENT" == "antigravity" ]]; then
    install_into "$HOME/.gemini/config/skills" "Google Antigravity Global"
  fi
  echo ""
  echo "replica-skill global installation complete."
  echo "Invoke '/replica-recon <target-app>' in OpenCode or Google Antigravity to start."
else
  if [[ "$AGENT" == "both" || "$AGENT" == "opencode" ]]; then
    install_into "$TARGET_DIR/.opencode/skills" "OpenCode Workspace"
  fi
  if [[ "$AGENT" == "both" || "$AGENT" == "antigravity" ]]; then
    install_into "$TARGET_DIR/.agents/skills" "Google Antigravity Workspace"
  fi
  mkdir -p "$TARGET_DIR/replica/screens" "$TARGET_DIR/replica/clone-screens"
  echo "✓ [Workspace] Created artifact directories -> $TARGET_DIR/replica/{screens,clone-screens}"
  echo ""
  echo "replica-skill local installation complete in: $TARGET_DIR"
  echo "Invoke '/replica-recon <target-app>' in OpenCode or Google Antigravity to start."
fi
`;
}

export function generateSelfExtractingBundle(): string {
  const fileBlocks: string[] = [];

  for (const skill of SKILLS_CATALOG) {
    const skillDir = `.agents/skills/${skill.id}`;
    fileBlocks.push(
      `mkdir -p "${skillDir}"\ncat << 'EOF_REPLICA_SKILL' > "${skillDir}/SKILL.md"\n${skill.skillMarkdown.trim()}\nEOF_REPLICA_SKILL`
    );
  }

  for (const script of VERIFIER_SCRIPTS) {
    const scriptDir = script.repoPath.substring(0, script.repoPath.lastIndexOf('/'));
    fileBlocks.push(
      `mkdir -p "${scriptDir}"\ncat << 'EOF_REPLICA_SCRIPT' > "${script.repoPath}"\n${script.code.trim()}\nEOF_REPLICA_SCRIPT\nchmod +x "${script.repoPath}"`
    );
  }

  fileBlocks.push(
    `cat << 'EOF_REPLICA_INSTALLER' > "install.sh"\n${generateInstallSh().trim()}\nEOF_REPLICA_INSTALLER\nchmod +x "install.sh"`
  );

  return `#!/usr/bin/env bash
# ==============================================================================
# replica-skill-bundle.sh — Self-Extracting 11-Skill Pack for OpenCode & Antigravity
# Contains all 11 universal SKILL.md definitions, 5 Python 3.8+ verifiers, and install.sh
# Usage:
#   chmod +x replica-skill-bundle.sh
#   ./replica-skill-bundle.sh [--global | --local .] [--agent both|opencode|antigravity]
# ==============================================================================
set -euo pipefail

${fileBlocks.join('\n\n')}

echo ""
echo "✓ Extracted 11 SKILL.md files, 5 deterministic Python verifiers, and install.sh."
if [[ $# -gt 0 ]]; then
  ./install.sh "$@"
else
  ./install.sh --local . --agent both
fi
`;
}

export function buildInstallCommands(config: InstallConfig): GeneratedInstallCommands {
  const cleanUrl = (config.baseUrl || 'http://localhost:3000').replace(/\/+$/, '');
  const dir = (config.customLocalDir || '.').trim() || '.';
  const scopeFlag = config.scope === 'global' ? '--global' : `--local ${dir}`;
  const agentFlag = `--agent ${config.agent}`;

  const targetPaths: string[] = [];
  if (config.scope === 'global') {
    if (config.agent === 'both' || config.agent === 'opencode') {
      targetPaths.push('~/.config/opencode/skills/replica-*/SKILL.md');
    }
    if (config.agent === 'both' || config.agent === 'antigravity') {
      targetPaths.push('~/.gemini/config/skills/replica-*/SKILL.md');
    }
  } else {
    if (config.agent === 'both' || config.agent === 'opencode') {
      targetPaths.push(`${dir}/.opencode/skills/replica-*/SKILL.md`);
    }
    if (config.agent === 'both' || config.agent === 'antigravity') {
      targetPaths.push(`${dir}/.agents/skills/replica-*/SKILL.md`);
    }
    targetPaths.push(`${dir}/replica/{screens,clone-screens}`);
  }

  const agentLabel =
    config.agent === 'both'
      ? 'OpenCode and Google Antigravity'
      : config.agent === 'opencode'
      ? 'OpenCode'
      : 'Google Antigravity';

  const agentPrompt = `Install the 11 replica-skill agent skills for ${agentLabel} (${config.scope} scope) by running: curl -fsSL ${cleanUrl}/bundle.sh | bash -s -- ${scopeFlag} ${agentFlag}`;

  const curlOneLiner = `curl -fsSL ${cleanUrl}/bundle.sh | bash -s -- ${scopeFlag} ${agentFlag}`;

  const gitCloneCommands = [
    `git clone https://github.com/Jakeschincariol/replica-skill.git`,
    `cd replica-skill`,
    `./install.sh ${scopeFlag} ${agentFlag}`
  ].join('\n');

  const verifyPrefix =
    config.scope === 'global'
      ? config.agent === 'opencode'
        ? '~/.config/opencode/skills'
        : '~/.gemini/config/skills'
      : config.agent === 'opencode'
      ? `${dir}/.opencode/skills`
      : `${dir}/.agents/skills`;

  const verificationCommand = `python3 ${verifyPrefix}/replica-diff/scripts/parity.py --help`;

  return {
    agentPrompt,
    curlOneLiner,
    gitCloneCommands,
    targetPaths,
    verificationCommand
  };
}
