from html.parser import HTMLParser
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(".")
HTML_FILES = [ROOT / "index.html", ROOT / "privacy.html"]

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

errors = []
checked = 0
for html_file in HTML_FILES:
    if not html_file.is_file():
        errors.append(f"Missing HTML page: {html_file}")
        continue
    scanner = LinkScanner()
    scanner.feed(html_file.read_text(encoding="utf-8"))
    for tag, attr, raw in scanner.links:
        checked += 1
        value = raw.strip()
        if not value or value.startswith(("https://", "http://", "mailto:", "tel:", "data:", "javascript:")):
            continue
        parts = urlsplit(value)
        if parts.scheme or parts.netloc:
            continue
        if parts.fragment and not parts.path:
            if unquote(parts.fragment) not in scanner.ids:
                errors.append(f"{html_file}: missing in-page target #{parts.fragment}")
            continue
        path = unquote(parts.path)
        target = (html_file.parent / path).resolve() if path else html_file.resolve()
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            errors.append(f"{html_file}: {tag} {attr} points to missing file: {value}")
        if parts.fragment and unquote(parts.fragment) not in scanner.ids and target == html_file.resolve():
            errors.append(f"{html_file}: missing in-page target #{parts.fragment}")

if errors:
    sys.exit("\n".join(errors))
print(f"Checked {checked} local references across {len(HTML_FILES)} HTML pages; all targets exist.")
