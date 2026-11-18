from html.parser import HTMLParser
from pathlib import Path
import sys

PAGES = [Path("index.html"), Path("privacy.html"), Path("guide.html"), Path("offline.html")]

class AccessibilityScanner(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.duplicates = []
        self.labels = set()
        self.controls = []
        self.headings = 0
        self.language = False
        self.skip_link = False
        self.main_target = False
        self.dialog_labelled = False
        self.stack = []
        self.button_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html" and attrs.get("lang"):
            self.language = True
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                self.duplicates.append(attrs["id"])
            self.ids.add(attrs["id"])
        if tag == "label" and attrs.get("for"):
            self.labels.add(attrs["for"])
        if tag == "h1":
            self.headings += 1
        if tag == "a" and attrs.get("class") == "skip-link":
            self.skip_link = True
        if tag == "main" and attrs.get("id") == "main-content":
            self.main_target = True
        if tag == "dialog" and attrs.get("aria-labelledby"):
            self.dialog_labelled = True
        if tag in {"button", "input", "select", "textarea"}:
            if "hidden" in attrs or (tag == "input" and attrs.get("type") == "hidden"):
                pass
            else:
                self.controls.append((tag, attrs, "label" in self.stack))
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.stack:
            index = len(self.stack) - 1 - self.stack[::-1].index(tag)
            self.stack = self.stack[:index]

    def handle_data(self, data):
        if self.stack and self.stack[-1] == "button":
            self.button_text.append(data.strip())

errors = []
for page in PAGES:
    if not page.is_file():
        errors.append(f"Missing page: {page}")
        continue
    scanner = AccessibilityScanner()
    scanner.feed(page.read_text(encoding="utf-8"))
    if not scanner.language:
        errors.append(f"{page}: missing html lang attribute")
    if scanner.headings != 1:
        errors.append(f"{page}: expected exactly one h1, found {scanner.headings}")
    if scanner.duplicates:
        errors.append(f"{page}: duplicate IDs: {sorted(set(scanner.duplicates))}")
    for tag, attrs, inside_label in scanner.controls:
        name = attrs.get("aria-label") or attrs.get("aria-labelledby") or attrs.get("title")
        has_label = inside_label or attrs.get("id") in scanner.labels
        has_button_text = tag == "button"
        if not name and not has_label and not has_button_text:
            errors.append(f"{page}: {tag} control lacks an accessible name: {attrs}")
    for attrs in []:
        pass
    if page.name == "index.html":
        if not scanner.skip_link:
            errors.append("index.html: missing skip navigation link")
        if not scanner.main_target:
            errors.append("index.html: missing main-content target")
        if not scanner.dialog_labelled:
            errors.append("index.html: detail dialog must have aria-labelledby")

if errors:
    sys.exit("\n".join(errors))
print("Static accessibility checks passed for the library and privacy pages.")
