from html.parser import HTMLParser
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(".")
HTML_FILE = ROOT / "index.html"

class LinkScanner(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.add(values["id"])
        for attr in ("href", "src"):
            value = values.get(attr)
            if value:
                self.links.append((tag, attr, value))

scanner = LinkScanner()
scanner.feed(HTML_FILE.read_text(encoding="utf-8"))
errors = []
for tag, attr, raw in scanner.links:
    value = raw.strip()
    if not value or value.startswith(("https://", "http://", "mailto:", "tel:", "data:", "javascript:")):
        continue
    parts = urlsplit(value)
    if parts.scheme or parts.netloc:
        continue
    if parts.fragment and not parts.path:
        if unquote(parts.fragment) not in scanner.ids:
            errors.append(f"Missing in-page target #{parts.fragment}")
        continue
    path = unquote(parts.path)
    target = (ROOT / path).resolve() if path else HTML_FILE.resolve()
    if target.is_dir():
        target = target / "index.html"
    if not target.exists():
        errors.append(f"{tag} {attr} points to missing file: {value}")
    if parts.fragment and unquote(parts.fragment) not in scanner.ids and target == HTML_FILE.resolve():
        errors.append(f"Missing in-page target #{parts.fragment}")

if errors:
    sys.exit("\n".join(errors))
print(f"Checked {len(scanner.links)} local HTML references; all targets exist.")
