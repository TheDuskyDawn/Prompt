import json, re, sys
from pathlib import Path
p = Path("data/resources.json")
try:
    data = json.loads(p.read_text(encoding="utf-8"))
except Exception as exc:
    sys.exit(f"Invalid JSON: {exc}")
if not isinstance(data, list):
    sys.exit("Catalogue must be a JSON array")
required = {"id", "type", "category", "title", "description", "tags", "date", "content"}
ids = set()
for i, item in enumerate(data):
    missing = required - item.keys()
    if missing: sys.exit(f"Entry {i}: missing {sorted(missing)}")
    if item["id"] in ids: sys.exit(f"Entry {i}: duplicate id {item['id']}")
    ids.add(item["id"])
    if item["type"] not in {"prompt", "skill"}: sys.exit(f"Entry {i}: invalid type")
    if not isinstance(item["tags"], list) or not all(isinstance(t, str) for t in item["tags"]): sys.exit(f"Entry {i}: tags must be strings")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", item["date"]): sys.exit(f"Entry {i}: date must be YYYY-MM-DD")
    for key in ("id", "category", "title", "description", "content"):
        if not isinstance(item[key], str) or not item[key].strip(): sys.exit(f"Entry {i}: {key} must be non-empty text")
print(f"Validated {len(data)} resources.")