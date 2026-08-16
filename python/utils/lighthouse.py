"""
lighthouse.py — [FEATURE P9] Static Lighthouse & Web Standards Audit Engine.
Checks HTML semantics, SEO meta tags, OpenGraph, JSON-LD, accessibility, and performance.
"""

import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.resolve()


def audit_portfolio(html_path: str = "index.html") -> dict:
    """Performs deep static audit of portfolio HTML structure."""
    target = BASE_DIR / html_path
    if not target.exists():
        return {"error": "index.html not found"}

    content = target.read_text(encoding="utf-8")

    checks = {
        "SEO": {
            "has_title": bool(re.search(r"<title>.+</title>", content, re.IGNORECASE)),
            "has_meta_description": 'name="description"' in content,
            "has_canonical": 'rel="canonical"' in content or 'og:url' in content,
            "has_open_graph": 'property="og:title"' in content and 'property="og:image"' in content,
            "has_json_ld": 'type="application/ld+json"' in content,
            "has_viewport": 'name="viewport"' in content,
        },
        "Accessibility": {
            "has_lang_attr": bool(re.search(r'<html[^>]+lang="[a-zA-Z\-]+"', content)),
            "has_main_heading": bool(re.search(r"<h1[^>]*>.*?</h1>", content, re.DOTALL)),
            "has_skip_link": "skip-link" in content,
            "has_aria_labels": 'aria-label=' in content,
            "images_have_alt": not bool(re.search(r'<img(?!.*?alt=)[^>]*>', content, re.IGNORECASE)),
        },
        "Performance & Best Practices": {
            "has_preload_or_preconnect": 'rel="preconnect"' in content or 'rel="preload"' in content,
            "has_module_scripts": 'type="module"' in content,
            "has_manifest": 'rel="manifest"' in content,
            "has_theme_color": 'name="theme-color"' in content,
        }
    }

    scores = {}
    for category, items in checks.items():
        passed = sum(1 for v in items.values() if v)
        total = len(items)
        scores[category] = int((passed / total) * 100)

    overall = int(sum(scores.values()) / len(scores))
    return {
        "overall_score": overall,
        "category_scores": scores,
        "details": checks
    }


if __name__ == "__main__":
    res = audit_portfolio()
    print(f"✓ Portfolio Static Audit Score: {res['overall_score']}/100")
    for cat, score in res["category_scores"].items():
        print(f"  - {cat}: {score}/100")
