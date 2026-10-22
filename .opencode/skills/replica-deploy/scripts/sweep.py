#!/usr/bin/env python3
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
