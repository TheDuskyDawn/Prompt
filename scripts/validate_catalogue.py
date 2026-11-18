import json
import re
import sys
from datetime import date
from pathlib import Path

catalogue_path = Path("data/resources.json")
try:
    resources = json.loads(catalogue_path.read_text(encoding="utf-8"))
except Exception as error:
    sys.exit(f"Invalid JSON: {error}")

if not isinstance(resources, list):
    sys.exit("Catalogue must be a JSON array")

required = {"id", "type", "category", "title", "description", "tags", "date", "content"}
seen_ids = set()

for index, item in enumerate(resources, start=1):
    prefix = f"Entry {index}"
    if not isinstance(item, dict):
        sys.exit(f"{prefix}: each resource must be an object")

    missing = required - item.keys()
    if missing:
        sys.exit(f"{prefix}: missing fields {sorted(missing)}")

    for field in ("id", "category", "title", "description", "content"):
        if not isinstance(item[field], str) or not item[field].strip():
            sys.exit(f"{prefix}: {field} must be non-empty text")

    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", item["id"]):
        sys.exit(f"{prefix}: id must use lowercase kebab-case")
    if item["id"] in seen_ids:
        sys.exit(f"{prefix}: duplicate id {item['id']}")
    seen_ids.add(item["id"])

    if item["type"] not in {"prompt", "skill"}:
        sys.exit(f"{prefix}: type must be prompt or skill")

    if not isinstance(item["tags"], list) or not item["tags"]:
        sys.exit(f"{prefix}: tags must be a non-empty array")
    if any(not isinstance(tag, str) or not tag.strip() for tag in item["tags"]):
        sys.exit(f"{prefix}: every tag must be non-empty text")
    if len(set(item["tags"])) != len(item["tags"]):
        sys.exit(f"{prefix}: duplicate tags are not allowed")

    if not isinstance(item["date"], str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", item["date"]):
        sys.exit(f"{prefix}: date must use YYYY-MM-DD")
    try:
        date.fromisoformat(item["date"])
    except ValueError:
        sys.exit(f"{prefix}: date is not a valid calendar date")

    if len(item["title"]) > 120:
        sys.exit(f"{prefix}: title exceeds 120 characters")
    if len(item["description"]) > 240:
        sys.exit(f"{prefix}: description exceeds 240 characters")
    if len(item["content"]) > 12000:
        sys.exit(f"{prefix}: content exceeds 12,000 characters")

print(f"Validated {len(resources)} resources across {len(seen_ids)} unique IDs.")
