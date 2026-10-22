#!/usr/bin/env python3
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
        if re.search(r"\b(S1|S2)\b", line, re.IGNORECASE) and re.search(r"\bopen\b", line, re.IGNORECASE):
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
