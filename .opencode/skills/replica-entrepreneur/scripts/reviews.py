#!/usr/bin/env python3
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
