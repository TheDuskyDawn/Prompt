from html.parser import HTMLParser
from pathlib import Path
import sys

PAGES = [Path("index.html"), Path("privacy.html"), Path("guide.html"), Path("offline.html")]
VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr"
}


class AccessibilityScanner(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.duplicates = []
        self.labels = set()
        self.controls = []
        self.images_without_alt = []
        self.headings = 0
        self.language = False
        self.skip_link = False
        self.main_target = False
        self.dialog_labelled = False
        self.label_depth = 0
        self.buttons = []

    def handle_starttag(self, tag, raw_attrs):
        attrs = dict(raw_attrs)
        if tag == "html" and attrs.get("lang"):
            self.language = True
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                self.duplicates.append(attrs["id"])
            self.ids.add(attrs["id"])
        if tag == "label":
            if attrs.get("for"):
                self.labels.add(attrs["for"])
            self.label_depth += 1
        if tag == "h1":
            self.headings += 1
        if tag == "a" and "skip-link" in attrs.get("class", "").split():
            self.skip_link = True
        if tag == "main" and attrs.get("id") == "main-content":
            self.main_target = True
        if tag == "dialog" and attrs.get("aria-labelledby"):
            self.dialog_labelled = True
        if tag == "img" and "alt" not in attrs:
            self.images_without_alt.append(attrs.get("src", "(unknown image)"))
        if tag in {"button", "input", "select", "textarea"}:
            hidden = "hidden" in attrs or (tag == "input" and attrs.get("type") == "hidden")
            if not hidden:
                self.controls.append((tag, attrs, self.label_depth > 0))
        if tag == "button":
            self.buttons.append({"attrs": attrs, "text": ""})

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == "label" and self.label_depth:
            self.label_depth -= 1
        if tag == "button" and self.buttons:
            button = self.buttons.pop()
            attrs = button["attrs"]
            accessible_name = (
                attrs.get("aria-label")
                or attrs.get("aria-labelledby")
                or attrs.get("title")
                or button["text"].strip()
            )
            if not accessible_name:
                self.controls.append(("unnamed-button", attrs, False))
        if tag not in VOID_ELEMENTS:
            # HTMLParser is not a browser tree builder; close the nearest matching
            # open element so nested inline markup does not corrupt label tracking.
            self.reset_tag_stack(tag)

    def reset_tag_stack(self, tag):
        # Kept intentionally small: only label nesting and button text are tracked.
        return

    def handle_data(self, data):
        for button in self.buttons:
            button["text"] += data


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
    if scanner.images_without_alt:
        errors.append(f"{page}: images missing alt text: {scanner.images_without_alt}")
    for tag, attrs, inside_label in scanner.controls:
        if tag == "unnamed-button":
            errors.append(f"{page}: button lacks an accessible name: {attrs}")
            continue
        name = attrs.get("aria-label") or attrs.get("aria-labelledby") or attrs.get("title")
        has_label = inside_label or attrs.get("id") in scanner.labels
        if not name and not has_label and tag != "button":
            errors.append(f"{page}: {tag} control lacks an accessible name: {attrs}")
    if page.name == "index.html":
        if not scanner.skip_link:
            errors.append("index.html: missing skip navigation link")
        if not scanner.main_target:
            errors.append("index.html: missing main-content target")
        if not scanner.dialog_labelled:
            errors.append("index.html: detail dialog must have aria-labelledby")

if errors:
    sys.exit("\\n".join(errors))
print(f"Static accessibility checks passed for {len(PAGES)} pages.")
