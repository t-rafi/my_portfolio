from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        for key in ("href", "src"):
            if attrs.get(key):
                self.urls.append(attrs[key])


root = Path("public")
page = root / "index.html"
parser = Links()
parser.feed(page.read_text(encoding="utf-8"))
errors = []
for url in parser.urls:
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc:
        continue
    target = root / unquote(parsed.path) if parsed.path else page
    if parsed.path and not target.exists():
        errors.append(f"Missing file: {url}")
    if parsed.fragment and (not parsed.path or parsed.path == "index.html") and parsed.fragment not in parser.ids:
        errors.append(f"Missing anchor: {url}")
for element_id in set(parser.ids):
    if parser.ids.count(element_id) > 1:
        errors.append(f"Duplicate id: {element_id}")

assets = []
for line in (root / "sw.js").read_text(encoding="utf-8").splitlines():
    line = line.strip().strip(",")
    if line.startswith("'./"):
        assets.append(line.strip("'"))
for asset in assets:
    if asset != "./" and not (root / asset[2:]).exists():
        errors.append(f"Missing service worker asset: {asset}")

print(f"Checked {len(parser.urls)} href/src values, {len(parser.ids)} IDs, {len(assets)} service worker assets")
for error in errors:
    print(error)
raise SystemExit(bool(errors))
