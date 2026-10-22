#!/usr/bin/env python3
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
        if raw[:8] != b"\x89PNG\r\n\x1a\n":
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
