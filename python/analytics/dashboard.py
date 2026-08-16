"""
dashboard.py — Real-time terminal analytics & lead collection dashboard.
Powered by Supabase and Rich.
"""

import sys
import json
import time
from datetime import datetime
import urllib.request
import urllib.parse

# Ensure UTF-8 stdout encoding for Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SUPABASE_URL = "https://uvjsrhbtzgrggjuucdyo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anNyaGJ0emdyZ2dqdXVjZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU5NDIsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdG-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E"

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
        def print(self, obj, *args, **kwargs):
            import re
            text = str(obj)
            cleaned = re.sub(r'\[/?[a-zA-Z0-9_ #]+\]', '', text)
            print(cleaned)
    console = ConsoleFallback()


def fetch_supabase(endpoint: str, query_params: dict = None) -> list:
    """Fetch records from Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    if query_params:
        url += "?" + urllib.parse.urlencode(query_params)
    
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data if isinstance(data, list) else []
    except Exception:
        return []


def format_time(iso_str: str) -> str:
    """Format ISO timestamp into human-readable local time."""
    if not iso_str:
        return "-"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%b %d, %H:%M")
    except Exception:
        return iso_str[:16].replace("T", " ")


def print_leads_dashboard():
    """Render Leads Collected panel and stats summary."""
    leads = fetch_supabase("leads", {"select": "*", "order": "created_at.desc", "limit": "20"})
    visits = fetch_supabase("visits", {"select": "id", "limit": "1000"})
    total_leads = len(fetch_supabase("leads", {"select": "id"}))
    total_visits = len(visits)

    if HAS_RICH:
        summary_text = (
            f"[bold cyan]Towhidul Islam Rafi — Portfolio Analytics & Lead Engine[/bold cyan]\n\n"
            f"📊 [bold white]Total Page Visits:[/bold white] [green]{total_visits}[/green]   |   "
            f"🎯 [bold white]Total Leads Collected:[/bold white] [bold yellow]{total_leads}[/bold yellow]   |   "
            f"⚡ [dim]Status: Live Tracking Active[/dim]"
        )
        console.print(Panel(summary_text, box=box.DOUBLE_EDGE, style="bold white on #0f172a"))

        table = Table(
            title="[bold yellow]🎯 LEADS COLLECTED (Last 20)[/bold yellow]",
            box=box.ROUNDED,
            header_style="bold cyan",
            expand=True
        )
        table.add_column("Time", style="dim", width=14)
        table.add_column("Name", style="bold white", width=18)
        table.add_column("Email", style="green", width=24)
        table.add_column("Company / Role", style="magenta", width=18)
        table.add_column("Source", style="cyan", width=14)
        table.add_column("Page", style="blue", overflow="ellipsis")

        if not leads:
            table.add_row("-", "No leads yet", "Waiting for visitors...", "-", "-", "-")
        else:
            for lead in leads:
                t = format_time(lead.get("created_at"))
                name = lead.get("name") or "Anonymous"
                email = lead.get("email") or "-"
                company = lead.get("company") or "[dim]N/A[/dim]"
                src = lead.get("source") or "unknown"
                src_badge = f"[bold yellow]{src}[/bold yellow]" if src == "cv_download" else f"[cyan]{src}[/cyan]"
                page = lead.get("page_url") or "/"
                page_clean = page.replace("https://t-rafi.github.io", "").replace("http://localhost:5500", "") or "/"

                table.add_row(t, name, email, company, src_badge, page_clean)

        console.print(table)
    else:
        print("=" * 70)
        print(f" Towhidul Islam Rafi — Analytics Dashboard")
        print(f" Total Visits: {total_visits} | Total Leads: {total_leads}")
        print("=" * 70)
        print(f"{'Time':<14} | {'Name':<18} | {'Email':<24} | {'Company':<16} | {'Source':<14}")
        print("-" * 70)
        if not leads:
            print("No leads collected yet.")
        else:
            for lead in leads:
                t = format_time(lead.get("created_at"))
                name = (lead.get("name") or "")[:18]
                email = (lead.get("email") or "")[:24]
                company = (lead.get("company") or "N/A")[:16]
                src = (lead.get("source") or "")[:14]
                print(f"{t:<14} | {name:<18} | {email:<24} | {company:<16} | {src:<14}")
        print("=" * 70)


def run_dashboard(auto_refresh: bool = False, interval: int = 10):
    """Run dashboard once or in auto-refresh loop."""
    try:
        while True:
            print_leads_dashboard()
            if not auto_refresh:
                break
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nDashboard closed.")


if __name__ == "__main__":
    auto = "--watch" in sys.argv or "--live" in sys.argv
    run_dashboard(auto_refresh=auto)
