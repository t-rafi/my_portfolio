"""
build.py — [FEATURE P10] Master One-Command Build Pipeline for GitHub Pages Portfolio.
Executes all asset generators, metadata pipelines, and static audits.
"""

import sys
import shutil
from pathlib import Path

# Add search paths
ROOT_DIR = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "python"))
sys.path.insert(0, str(ROOT_DIR / "python" / "data"))
sys.path.insert(0, str(ROOT_DIR / "python" / "generators"))
sys.path.insert(0, str(ROOT_DIR / "python" / "analytics"))
sys.path.insert(0, str(ROOT_DIR / "python" / "utils"))

# Set UTF-8 encoding
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich import box
    console = Console()
    HAS_RICH = True
except ImportError:
    HAS_RICH = False
    class ConsoleFallback:
        def print(self, *args, **kwargs):
            text = " ".join(str(a) for a in args)
            import re
            cleaned = re.sub(r'\[/?[a-zA-Z0-9_ #]+\]', '', text)
            print(cleaned)
    console = ConsoleFallback()

from build_extras import generate_readme, generate_sitemap, generate_robots, generate_jsonld
from og_image_generator import generate_og_image
from skill_radar import generate_skill_radar
from github_stats import fetch_github_stats
from cv_diff import snapshot_and_diff_cv
from lighthouse import audit_portfolio


def run_pipeline():
    """Executes the full automated build pipeline."""
    console.print("\n[bold cyan]🚀 INITIATING PORTFOLIO PRODUCTION BUILD PIPELINE[/bold cyan]\n")

    steps_completed = []

    # 1. README Generator (P1)
    try:
        generate_readme()
        steps_completed.append(("P1: Profile README", "README.md", "[bold green]PASS[/bold green]"))
    except Exception as e:
        steps_completed.append(("P1: Profile README", str(e), "[bold red]FAIL[/bold red]"))

    # 2. Sitemap & Robots Generator (P2)
    try:
        generate_sitemap()
        generate_robots()
        steps_completed.append(("P2: Sitemap & Robots", "sitemap.xml, robots.txt", "[bold green]PASS[/bold green]"))
    except Exception as e:
        steps_completed.append(("P2: Sitemap & Robots", str(e), "[bold red]FAIL[/bold red]"))

    # 3. JSON-LD Structured Data (P3)
    try:
        generate_jsonld()
        steps_completed.append(("P3: Schema.org JSON-LD", "structured_data.jsonld", "[bold green]PASS[/bold green]"))
    except Exception as e:
        steps_completed.append(("P3: Schema.org JSON-LD", str(e), "[bold red]FAIL[/bold red]"))

    # 4. OpenGraph Social Card (P4)
    try:
        og_path = generate_og_image()
        steps_completed.append(("P4: OpenGraph Image", og_path, "[bold green]PASS[/bold green]"))
    except Exception as e:
        steps_completed.append(("P4: OpenGraph Image", str(e), "[bold red]FAIL[/bold red]"))

    # 5. Skill Radar Chart (P6)
    try:
        radar_path = generate_skill_radar()
        steps_completed.append(("P6: Skill Radar Chart", radar_path, "[bold green]PASS[/bold green]"))
    except Exception as e:
        steps_completed.append(("P6: Skill Radar Chart", str(e), "[bold red]FAIL[/bold red]"))

    # 6. GitHub Stats Cache (P7)
    try:
        gh_data = fetch_github_stats()
        steps_completed.append(("P7: GitHub Live Stats", f"{gh_data.get('public_repos', 0)} repos cached", "[bold green]PASS[/bold green]"))
    except Exception as e:
        steps_completed.append(("P7: GitHub Live Stats", str(e), "[bold red]FAIL[/bold red]"))

    # 7. CV Snapshot Diff (P8)
    try:
        diff_res = snapshot_and_diff_cv()
        steps_completed.append(("P8: CV Snapshot Diff", f"Status: {diff_res['status']}", "[bold green]PASS[/bold green]"))
    except Exception as e:
        steps_completed.append(("P8: CV Snapshot Diff", str(e), "[bold red]FAIL[/bold red]"))

    # 8. Static Web Standards Audit (P9)
    try:
        audit_res = audit_portfolio()
        score = audit_res.get("overall_score", 100)
        steps_completed.append(("P9: Lighthouse Static Audit", f"Overall Score: {score}/100", "[bold green]PASS[/bold green]"))
    except Exception as e:
        steps_completed.append(("P9: Lighthouse Static Audit", str(e), "[bold red]FAIL[/bold red]"))

    # 9. Sync Public Distribution Folder
    pub_dir = ROOT_DIR / "public"
    pub_dir.mkdir(parents=True, exist_ok=True)
    for asset in ["index.html", "guestbook.html", "Dashboard.html", "manifest.json", "sw.js", "robots.txt", "sitemap.xml", "structured_data.jsonld"]:
        src = ROOT_DIR / asset
        if src.exists():
            shutil.copy2(src, pub_dir / asset)

    for folder in ["src", "assets"]:
        src_f = ROOT_DIR / folder
        dst_f = pub_dir / folder
        if src_f.exists():
            shutil.copytree(src_f, dst_f, dirs_exist_ok=True)

    steps_completed.append(("P10: Public Bundle Sync", "public/ distribution ready", "[bold green]PASS[/bold green]"))

    # Render Summary Table
    if HAS_RICH:
        table = Table(title="[bold green]✨ PORTFOLIO BUILD COMPLETED SUCCESSFULLY[/bold green]", box=box.ROUNDED)
        table.add_column("Pipeline Step", style="bold cyan", width=28)
        table.add_column("Output / Artifact", style="white", width=42)
        table.add_column("Status", justify="center", width=10)

        for step, artifact, status in steps_completed:
            table.add_row(step, artifact, status)
        console.print(table)
    else:
        print("\n" + "=" * 70)
        print(" PORTFOLIO BUILD COMPLETED SUCCESSFULLY")
        print("=" * 70)
        for step, artifact, status in steps_completed:
            print(f"[{step:<28}] {artifact:<38} | {status}")
        print("=" * 70)


if __name__ == "__main__":
    run_pipeline()
