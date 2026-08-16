"""
og_image_generator.py — [FEATURE P4] Generates OpenGraph Social Preview Image (1200x630px).
"""

import os
import sys
from pathlib import Path

# Add python path
BASE_DIR = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "python" / "data"))

from cv_data import CV_DATA, CVData


def generate_og_svg(cv: CVData = CV_DATA, output_path: str = "assets/generated/og_image.svg") -> str:
    """Generate high-resolution vector OpenGraph preview (1200x630)."""
    svg_content = f"""<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#08090C"/>
  <circle cx="1050" cy="150" r="300" fill="#6C8BFF" fill-opacity="0.08"/>
  <circle cx="150" cy="500" r="250" fill="#4ADE80" fill-opacity="0.05"/>
  
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="#0F1117" stroke="#1E2030" stroke-width="2"/>
  
  <!-- Status Badge -->
  <rect x="110" y="110" width="160" height="36" rx="18" fill="#1A2040" stroke="#6C8BFF" stroke-opacity="0.4"/>
  <circle cx="130" cy="128" r="5" fill="#4ADE80"/>
  <text x="145" y="133" fill="#6C8BFF" font-family="sans-serif" font-size="14" font-weight="600">Open to work</text>
  
  <!-- Name & Title -->
  <text x="110" y="210" fill="#E8EAF0" font-family="sans-serif" font-size="52" font-weight="800">{cv.contact.name}</text>
  <text x="110" y="260" fill="#6C8BFF" font-family="sans-serif" font-size="26" font-weight="600">{cv.contact.title}</text>
  
  <!-- Summary -->
  <text x="110" y="320" fill="#9299B0" font-family="sans-serif" font-size="18" font-weight="400">
    <tspan x="110" dy="0">Specializing in enterprise ERP software, ASP.NET Core, C#, EF Core,</tspan>
    <tspan x="110" dy="28">SQL Server, RDLC reporting, IIS deployment, and production support.</tspan>
  </text>
  
  <!-- Stats Row -->
  <g transform="translate(110, 420)">
    <rect width="180" height="85" rx="12" fill="#161820" stroke="#1E2030"/>
    <text x="20" y="42" fill="#E8EAF0" font-family="sans-serif" font-size="28" font-weight="800">30<tspan fill="#6C8BFF">+</tspan></text>
    <text x="20" y="66" fill="#9299B0" font-family="sans-serif" font-size="13">RDLC Reports</text>
    
    <rect x="200" width="180" height="85" rx="12" fill="#161820" stroke="#1E2030"/>
    <text x="220" y="42" fill="#E8EAF0" font-family="sans-serif" font-size="28" font-weight="800">20<tspan fill="#6C8BFF">+</tspan></text>
    <text x="220" y="66" fill="#9299B0" font-family="sans-serif" font-size="13">ERP Domains</text>
    
    <rect x="400" width="180" height="85" rx="12" fill="#161820" stroke="#1E2030"/>
    <text x="420" y="42" fill="#E8EAF0" font-family="sans-serif" font-size="28" font-weight="800">.NET</text>
    <text x="420" y="66" fill="#9299B0" font-family="sans-serif" font-size="13">Enterprise Stack</text>
  </g>
  
  <!-- Right Brand / URL -->
  <text x="1080" y="520" text-anchor="end" fill="#6C8BFF" font-family="sans-serif" font-size="18" font-weight="700">t-rafi.github.io</text>
</svg>"""

    out_file = BASE_DIR / output_path
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(svg_content, encoding="utf-8")
    return str(out_file)


def generate_og_image(cv: CVData = CV_DATA, output_path: str = "assets/generated/og_image.png") -> str:
    """Generate PNG OpenGraph preview using PIL/Pillow or SVG vector fallback."""
    svg_path = generate_og_svg(cv)

    try:
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new("RGB", (1200, 630), color="#08090C")
        draw = ImageDraw.Draw(img)

        # Card container
        draw.rounded_rectangle([60, 60, 1140, 570], radius=24, fill="#0F1117", outline="#1E2030", width=2)
        draw.rounded_rectangle([110, 110, 270, 146], radius=18, fill="#1A2040", outline="#6C8BFF", width=1)
        draw.ellipse([125, 123, 135, 133], fill="#4ADE80")

        # Text elements
        draw.text((145, 120), "Open to work", fill="#6C8BFF")
        draw.text((110, 180), cv.contact.name, fill="#E8EAF0")
        draw.text((110, 240), cv.contact.title, fill="#6C8BFF")
        draw.text((110, 300), "Enterprise ERP Software · ASP.NET Core · C# · SQL Server · RDLC Reports", fill="#9299B0")
        draw.text((110, 480), "Live Portfolio: https://t-rafi.github.io", fill="#6C8BFF")

        out_file = BASE_DIR / output_path
        out_file.parent.mkdir(parents=True, exist_ok=True)
        img.save(out_file, "PNG")
        return str(out_file)
    except Exception:
        # Fallback is SVG
        return svg_path


if __name__ == "__main__":
    p = generate_og_image()
    print(f"✓ Generated OpenGraph Preview: {p}")
