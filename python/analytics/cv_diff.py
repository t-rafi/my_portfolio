"""
cv_diff.py — [FEATURE P8] Snapshots cv_data.py and reports differences across builds.
"""

import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "python" / "data"))

from cv_data import CV_DATA, CVData


def snapshot_and_diff_cv(cv: CVData = CV_DATA, snapshot_path: str = "assets/generated/cv_snapshot.json") -> dict:
    """Takes a snapshot of CV data and outputs a diff report."""
    current_data = {
        "name": cv.contact.name,
        "title": cv.contact.title,
        "location": cv.contact.location,
        "skills": [s.strip() for s in cv.skills_text.split(",")],
        "stats": cv.stats,
        "experiences_count": len(cv.experiences),
        "projects_count": len(cv.projects),
        "latest_company": cv.experiences[0].company if cv.experiences else None
    }

    out_file = BASE_DIR / snapshot_path
    diff = {"status": "INITIAL", "added_skills": [], "removed_skills": []}

    if out_file.exists():
        try:
            previous_data = json.loads(out_file.read_text(encoding="utf-8"))
            prev_skills = set(previous_data.get("skills", []))
            curr_skills = set(current_data["skills"])

            added = list(curr_skills - prev_skills)
            removed = list(prev_skills - curr_skills)

            diff = {
                "status": "MODIFIED" if (added or removed or previous_data != current_data) else "UNCHANGED",
                "added_skills": added,
                "removed_skills": removed,
                "previous": previous_data,
                "current": current_data
            }
        except Exception:
            diff["status"] = "ERROR_READING_PREVIOUS"

    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(json.dumps(current_data, indent=2), encoding="utf-8")
    return diff


if __name__ == "__main__":
    d = snapshot_and_diff_cv()
    print(f"✓ CV Snapshot Status: {d['status']}")
