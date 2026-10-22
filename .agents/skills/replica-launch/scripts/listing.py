#!/usr/bin/env python3
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
    ("best", re.compile(r"\bbest\b", re.IGNORECASE)),
    ("top", re.compile(r"\btop\b", re.IGNORECASE)),
    ("free", re.compile(r"\bfree\b", re.IGNORECASE)),
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
