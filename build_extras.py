"""
build_extras.py — Build-time assets and metadata generator for GitHub Pages portfolio.
"""

import sys
from pathlib import Path
from cv_data import CV_DATA, CVData

# Ensure UTF-8 stdout encoding for Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    console = Console()
except ImportError:
    class ConsoleFallback:
        def print(self, *args, **kwargs):
            # Clean rich tags if rich not installed
            text = " ".join(str(a) for a in args)
            import re
            cleaned = re.sub(r'\[/?[a-zA-Z0-9_ ]+\]', '', text)
            print(cleaned)
    console = ConsoleFallback()


# [FEATURE P1] Auto README Generator
def generate_readme(cv: CVData = CV_DATA, output_path: str = "README.md") -> str:
    """
    Generates a professional GitHub profile README.md using CV_DATA.
    Includes animated typing SVG, skill badges, stats, timeline, and contact links.
    """
    badge_map = {
        "C#": "https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white",
        "ASP.NET Core": "https://img.shields.io/badge/ASP.NET_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white",
        "EF Core": "https://img.shields.io/badge/EF_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white",
        "SQL Server": "https://img.shields.io/badge/Microsoft%20SQL%20Server-CC292B?style=for-the-badge&logo=microsoftsqlserver&logoColor=white",
        "RDLC/SSRS": "https://img.shields.io/badge/RDLC%20%2F%20SSRS-0078D4?style=for-the-badge&logo=microsoft&logoColor=white",
        "HTML5/CSS3": "https://img.shields.io/badge/HTML5%20%2F%20CSS3-E34F26?style=for-the-badge&logo=html5&logoColor=white",
        "JavaScript": "https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black",
        "Razor Views": "https://img.shields.io/badge/Razor_Views-512BD4?style=for-the-badge&logo=dotnet&logoColor=white",
        "IIS": "https://img.shields.io/badge/IIS-0078D4?style=for-the-badge&logo=windows&logoColor=white",
        "Git": "https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"
    }

    skills_list = [s.strip() for s in cv.skills_text.split(",")]
    skill_badges = []
    for skill in skills_list:
        badge_url = badge_map.get(skill, f"https://img.shields.io/badge/{skill.replace(' ', '%20')}-6c8bff?style=for-the-badge")
        skill_badges.append(f"![{skill}]({badge_url})")

    badges_md = " ".join(skill_badges)

    # Current working position
    latest_exp = cv.experiences[0] if cv.experiences else None
    current_work = f"🔭 **Currently working at**: **{latest_exp.company}** as *{latest_exp.role}* ({latest_exp.period})\n> {latest_exp.summary}" if latest_exp else ""

    # Stats table
    stats_md = "| Metric | Highlights |\n| :--- | :--- |\n"
    for s in cv.stats:
        parts = s.split(" ", 1)
        val = parts[0]
        desc = parts[1] if len(parts) > 1 else ""
        stats_md += f"| **{val}** | {desc} |\n"

    # Experience timeline
    exp_md = ""
    for exp in cv.experiences:
        exp_md += f"### 💼 {exp.role} · **{exp.company}**\n"
        exp_md += f"*{exp.period}*\n\n"
        exp_md += f"{exp.summary}\n\n"
        for bullet in exp.bullets:
            exp_md += f"- {bullet}\n"
        exp_md += "\n"

    # Projects
    projects_md = ""
    for proj in cv.projects:
        projects_md += f"- **{proj.title}**: {proj.description}\n"

    # Contact items
    contact = cv.contact
    contact_md = f"""- 🌐 **Portfolio**: [t-rafi.github.io](https://t-rafi.github.io/)
- 📧 **Email**: [{contact.email}](mailto:{contact.email})
- 💼 **LinkedIn**: [{contact.linkedin}](https://{contact.linkedin})
- 🐙 **GitHub**: [{contact.github}](https://{contact.github})
- 📍 **Location**: {contact.location}
"""

    typing_query = "lines=Junior+Software+Engineer;ASP.NET+Core+%26+ERP+Systems;Enterprise+Software+Developer&center=true&width=500&height=50&color=6C8BFF"

    readme_content = f"""<div align="center">

# Hi there, I'm {contact.name.split(' ')[-1].strip('()')} 👋

[![Typing SVG](https://readme-typing-svg.demolab.com?{typing_query})](https://t-rafi.github.io)

<p align="center">
  <a href="https://t-rafi.github.io"><img src="https://img.shields.io/badge/Portfolio-Live_Site-6c8bff?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Portfolio"></a>
  <a href="https://{contact.linkedin}"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="mailto:{contact.email}"><img src="https://img.shields.io/badge/Email-Contact_Me-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"></a>
</p>

</div>

---

### 🚀 About Me
{cv.summary}

{current_work}

---

### 🛠️ Tech Stack & Skills
<div align="center">

{badges_md}

</div>

---

### 📊 Production Highlights
{stats_md}

---

### 💼 Experience Timeline
{exp_md}

---

### 📂 Featured Projects
{projects_md}

---

### 🎓 Academic Background
- **{cv.education.degree}**
- {cv.education.institution} ({cv.education.period}) — **CGPA: {cv.education.gpa}** ({cv.education.status})

---

### 📬 Connect With Me
{contact_md}

<div align="center">
  <sub>Built with ❤️ and auto-generated from <code>cv_data.py</code></sub>
</div>
"""

    out_file = Path(output_path)
    out_file.write_text(readme_content, encoding="utf-8")

    console.print(f"[bold green]✓[/bold green] Generated README.md at [cyan]{out_file.resolve()}[/cyan] ({len(readme_content)} bytes)")
    return readme_content


# [FEATURE P2] Sitemap & Robots.txt Generator
def generate_sitemap(base_url: str = "https://t-rafi.github.io/", output_path: str = "sitemap.xml") -> str:
    """
    Generates sitemap.xml for the portfolio including all main section anchors
    with proper change frequency and priority settings.
    """
    from datetime import date
    today = date.today().isoformat()
    base = base_url.rstrip("/")

    routes = [
        {"path": "/", "changefreq": "weekly", "priority": "1.0"},
        {"path": "/#about", "changefreq": "monthly", "priority": "0.8"},
        {"path": "/#experience", "changefreq": "monthly", "priority": "0.9"},
        {"path": "/#skills", "changefreq": "monthly", "priority": "0.8"},
        {"path": "/#projects", "changefreq": "weekly", "priority": "0.9"},
        {"path": "/#education", "changefreq": "yearly", "priority": "0.7"},
        {"path": "/#contact", "changefreq": "monthly", "priority": "0.8"},
        {"path": "/guestbook.html", "changefreq": "daily", "priority": "0.6"},
    ]

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    for r in routes:
        loc = f"{base}{r['path']}"
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{loc}</loc>")
        xml_lines.append(f"    <lastmod>{today}</lastmod>")
        xml_lines.append(f"    <changefreq>{r['changefreq']}</changefreq>")
        xml_lines.append(f"    <priority>{r['priority']}</priority>")
        xml_lines.append("  </url>")

    xml_lines.append("</urlset>")
    sitemap_xml = "\n".join(xml_lines)

    out_file = Path(output_path)
    out_file.write_text(sitemap_xml, encoding="utf-8")

    console.print(f"[bold green]✓[/bold green] Generated sitemap.xml at [cyan]{out_file.resolve()}[/cyan] ({len(routes)} URLs)")
    return sitemap_xml


def generate_robots(base_url: str = "https://t-rafi.github.io/", output_path: str = "robots.txt") -> str:
    """
    Generates robots.txt granting full access to search crawlers
    and declaring the sitemap location.
    """
    base = base_url.rstrip("/")
    robots_content = f"""# robots.txt for {base}
User-agent: *
Allow: /

# Sitemap Location
Sitemap: {base}/sitemap.xml
"""

    out_file = Path(output_path)
    out_file.write_text(robots_content, encoding="utf-8")

    console.print(f"[bold green]✓[/bold green] Generated robots.txt at [cyan]{out_file.resolve()}[/cyan]")
    return robots_content


# [FEATURE P3] Structured Data JSON-LD Generator
def generate_jsonld(cv: CVData = CV_DATA, output_path: str = "structured_data.jsonld", base_url: str = "https://t-rafi.github.io/") -> str:
    """
    Generates complete Schema.org Person, WebSite, and BreadcrumbList JSON-LD structured data.
    """
    import json
    base = base_url.rstrip("/")
    skills_list = [s.strip() for s in cv.skills_text.split(",")]

    structured_data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": f"{base}/#person",
                "name": "Towhidul Islam Rafi",
                "alternateName": cv.contact.name,
                "jobTitle": cv.contact.title,
                "url": base,
                "email": f"mailto:{cv.contact.email}",
                "telephone": cv.contact.phone,
                "image": f"{base}/assets/img/profile.jpeg",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": cv.contact.location
                },
                "sameAs": [
                    f"https://{cv.contact.github}",
                    f"https://{cv.contact.linkedin}"
                ],
                "knowsAbout": skills_list,
                "worksFor": {
                    "@type": "Organization",
                    "name": cv.experiences[0].company if cv.experiences else "iTech Velocity",
                    "roleName": cv.experiences[0].role if cv.experiences else "Junior Software Engineer"
                },
                "alumniOf": {
                    "@type": "EducationalOrganization",
                    "name": cv.education.institution,
                    "educationalLevel": cv.education.degree
                }
            },
            {
                "@type": "WebSite",
                "@id": f"{base}/#website",
                "url": base,
                "name": "Towhidul Islam Rafi — Junior Software Engineer Portfolio",
                "description": cv.summary,
                "author": {
                    "@id": f"{base}/#person"
                },
                "inLanguage": "en"
            },
            {
                "@type": "BreadcrumbList",
                "@id": f"{base}/#breadcrumb",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{base}/"},
                    {"@type": "ListItem", "position": 2, "name": "About", "item": f"{base}/#about"},
                    {"@type": "ListItem", "position": 3, "name": "Experience", "item": f"{base}/#experience"},
                    {"@type": "ListItem", "position": 4, "name": "Skills", "item": f"{base}/#skills"},
                    {"@type": "ListItem", "position": 5, "name": "Projects", "item": f"{base}/#projects"},
                    {"@type": "ListItem", "position": 6, "name": "Education", "item": f"{base}/#education"},
                    {"@type": "ListItem", "position": 7, "name": "Contact", "item": f"{base}/#contact"}
                ]
            }
        ]
    }

    jsonld_str = json.dumps(structured_data, indent=2, ensure_ascii=False)
    out_file = Path(output_path)
    out_file.write_text(jsonld_str, encoding="utf-8")

    console.print(f"[bold green]✓[/bold green] Generated structured_data.jsonld at [cyan]{out_file.resolve()}[/cyan]")
    return jsonld_str


if __name__ == "__main__":
    generate_readme()
    generate_sitemap()
    generate_robots()
    generate_jsonld()


