import json
import re
import sys
from pathlib import Path

root = Path(".")
manifest_path = root / "manifest.webmanifest"
try:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
except Exception as error:
    sys.exit(f"Invalid web app manifest: {error}")

for field in ("name", "short_name", "start_url", "scope", "display", "icons"):
    if field not in manifest:
        sys.exit(f"Web app manifest is missing {field}")

if manifest["display"] not in {"standalone", "minimal-ui", "fullscreen"}:
    sys.exit("Web app manifest display mode is not install-friendly")
if not isinstance(manifest["icons"], list) or not manifest["icons"]:
    sys.exit("Web app manifest must declare at least one icon")

for icon in manifest["icons"]:
    if not isinstance(icon, dict) or not icon.get("src"):
        sys.exit("Every manifest icon must have a src")
    icon_path = root / icon["src"]
    if not icon_path.is_file():
        sys.exit(f"Manifest icon does not exist: {icon['src']}")

worker = (root / "service-worker.js").read_text(encoding="utf-8")
app = (root / "app.js").read_text(encoding="utf-8")
page = (root / "index.html").read_text(encoding="utf-8")

if 'serviceWorker.register("./service-worker.js")' not in app:
    sys.exit("The app does not register its service worker")
if 'rel="manifest" href="manifest.webmanifest"' not in page:
    sys.exit("The page does not link its web app manifest")

assets_block = worker.split("const CORE_ASSETS = [", 1)[-1].split("];", 1)[0]
assets = re.findall(r'"(\./[^"]+)"', assets_block)
if not assets:
    sys.exit("The service worker has no core assets")
for asset in assets:
    target = root / asset.removeprefix("./")
    if asset == "./":
        target = root / "index.html"
    if not target.is_file():
        sys.exit(f"Service worker core asset does not exist: {asset}")

for event in ('"install"', '"activate"', '"fetch"'):
    if event not in worker:
        sys.exit(f"Service worker is missing its {event} handler")

print(f"Validated manifest, {len(manifest['icons'])} app icon(s), and {len(assets)} offline assets.")
