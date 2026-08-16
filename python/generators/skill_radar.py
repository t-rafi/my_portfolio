"""
skill_radar.py — [FEATURE P6] Matplotlib / SVG Skill Radar Chart Generator.
"""

import math
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.resolve()


def generate_skill_radar_svg(output_path: str = "assets/generated/skill_radar.svg") -> str:
    """Generate modern SVG radar chart with 6 skill dimensions."""
    skills = [
        {"name": "ASP.NET Core & C#", "score": 92},
        {"name": "SQL Server & EF", "score": 88},
        {"name": "RDLC & Reporting", "score": 95},
        {"name": "Frontend & JS", "score": 80},
        {"name": "IIS & DevOps", "score": 82},
        {"name": "ERP Architecture", "score": 90}
    ]

    size = 400
    cx, cy = 200, 200
    radius = 130
    n = len(skills)

    # Calculate grid rings
    rings_svg = ""
    for level in [0.25, 0.5, 0.75, 1.0]:
        r = radius * level
        points = []
        for i in range(n):
            angle = (i * 2 * math.pi / n) - (math.pi / 2)
            px = cx + r * math.cos(angle)
            py = cy + r * math.sin(angle)
            points.append(f"{px:.1f},{py:.1f}")
        rings_svg += f'<polygon points="{" ".join(points)}" fill="none" stroke="#1E2030" stroke-width="1"/>\\n'

    # Calculate axes lines & labels
    axes_svg = ""
    labels_svg = ""
    poly_points = []

    for i, s in enumerate(skills):
        angle = (i * 2 * math.pi / n) - (math.pi / 2)
        ax = cx + radius * math.cos(angle)
        ay = cy + radius * math.sin(angle)
        axes_svg += f'<line x1="{cx}" y1="{cy}" x2="{ax:.1f}" y2="{ay:.1f}" stroke="#1E2030" stroke-width="1"/>\\n'

        # Data point
        val_r = radius * (s["score"] / 100.0)
        vx = cx + val_r * math.cos(angle)
        vy = cy + val_r * math.sin(angle)
        poly_points.append(f"{vx:.1f},{vy:.1f}")

        # Label pos
        lx = cx + (radius + 24) * math.cos(angle)
        ly = cy + (radius + 24) * math.sin(angle)
        anchor = "middle"
        if math.cos(angle) > 0.3:
            anchor = "start"
        elif math.cos(angle) < -0.3:
            anchor = "end"
        labels_svg += f'<text x="{lx:.1f}" y="{ly + 4:.1f}" text-anchor="{anchor}" fill="#8B949E" font-family="sans-serif" font-size="11" font-weight="600">{s["name"]}</text>\\n'

    data_polygon = f'<polygon points="{" ".join(poly_points)}" fill="#6C8BFF" fill-opacity="0.28" stroke="#6C8BFF" stroke-width="2.5"/>'

    svg = f"""<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="{size}" height="{size}" rx="16" fill="#0F1117"/>
  {rings_svg}
  {axes_svg}
  {data_polygon}
  {labels_svg}
</svg>"""

    out_file = BASE_DIR / output_path
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(svg, encoding="utf-8")
    return str(out_file)


def generate_skill_radar(output_path: str = "assets/generated/skill_radar.png") -> str:
    """Generate Radar chart in PNG using Matplotlib or SVG fallback."""
    svg_path = generate_skill_radar_svg()

    try:
        import numpy as np
        import matplotlib.pyplot as plt

        categories = ["ASP.NET Core & C#", "SQL Server & EF", "RDLC & Reporting", "Frontend & JS", "IIS & DevOps", "ERP Architecture"]
        values = [92, 88, 95, 80, 82, 90]
        N = len(categories)

        angles = [n / float(N) * 2 * np.pi for n in range(N)]
        values += values[:1]
        angles += angles[:1]

        fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
        fig.patch.set_facecolor('#0F1117')
        ax.set_facecolor('#0F1117')

        plt.xticks(angles[:-1], categories, color='#8B949E', size=9, weight='bold')
        ax.tick_params(colors='#8B949E', pad=10)
        ax.set_rlabel_position(0)
        plt.yticks([25, 50, 75, 100], ["25%", "50%", "75%", "100%"], color="#484F58", size=8)
        plt.ylim(0, 100)

        ax.plot(angles, values, color='#6C8BFF', linewidth=2.5, linestyle='solid')
        ax.fill(angles, values, color='#6C8BFF', alpha=0.3)

        out_file = BASE_DIR / output_path
        out_file.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(out_file, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight', dpi=150)
        plt.close()
        return str(out_file)
    except Exception:
        return svg_path


if __name__ == "__main__":
    p = generate_skill_radar()
    print(f"✓ Generated Skill Radar Chart: {p}")
