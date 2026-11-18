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

required = {"id", "type", "category", "title", "description", "tags", "date", "content", "difficulty", "collections", "review_status", "quality_review"}
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

    if item["difficulty"] not in {"beginner", "intermediate", "advanced"}:
        sys.exit(f"{prefix}: difficulty must be beginner, intermediate, or advanced")

    if item["type"] not in {"prompt", "skill"}:
        sys.exit(f"{prefix}: type must be prompt or skill")

    if not isinstance(item["review_status"], str) or item["review_status"] not in {"curated", "community", "pending"}:
        sys.exit(f"{prefix}: review_status must be curated, community, or pending")

    quality = item["quality_review"]
    if not isinstance(quality, dict):
        sys.exit(f"{prefix}: quality_review must be an object")
    if quality.get("rubric_version") != "1.0":
        sys.exit(f"{prefix}: quality_review.rubric_version must be 1.0")
    quality_status = quality.get("status")
    if quality_status not in {"not-assessed", "assessed", "needs-revision", "ready"}:
        sys.exit(f"{prefix}: invalid quality_review.status")
    if quality_status == "not-assessed":
        if quality.get("scores") is not None or quality.get("reviewer") is not None or quality.get("reviewed_at") is not None:
            sys.exit(f"{prefix}: not-assessed quality reviews must not contain scores, reviewer, or reviewed_at")
    else:
        scores = quality.get("scores")
        dimensions = {"clarity", "completeness", "usefulness", "originality", "limitations"}
        if not isinstance(scores, dict) or set(scores) != dimensions:
            sys.exit(f"{prefix}: completed quality reviews require exactly five rubric dimensions")
        if any(type(score) is not int or score < 1 or score > 5 for score in scores.values()):
            sys.exit(f"{prefix}: quality scores must be integers from 1 to 5")
        if not isinstance(quality.get("reviewer"), str) or not quality["reviewer"].strip():
            sys.exit(f"{prefix}: completed quality reviews require a reviewer")
        if not isinstance(quality.get("reviewed_at"), str) or not re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", quality["reviewed_at"]):
            sys.exit(f"{prefix}: completed quality reviews require reviewed_at in YYYY-MM-DD format")
        try:
            date.fromisoformat(quality["reviewed_at"])
        except ValueError:
            sys.exit(f"{prefix}: quality review date is not a valid calendar date")
        if not isinstance(quality.get("notes"), str):
            sys.exit(f"{prefix}: quality review notes must be text")
        minimum = min(scores.values())
        if quality_status == "ready" and minimum < 3:
            sys.exit(f"{prefix}: ready quality reviews require every score to be at least 3")
        if quality_status == "needs-revision" and minimum > 2:
            sys.exit(f"{prefix}: needs-revision requires at least one score of 1 or 2")

    if not isinstance(item["collections"], list) or not item["collections"]:
        sys.exit(f"{prefix}: collections must be a non-empty array")
    if any(not isinstance(name, str) or not name.strip() for name in item["collections"]):
        sys.exit(f"{prefix}: collection names must be non-empty text")
    if len(set(item["collections"])) != len(item["collections"]):
        sys.exit(f"{prefix}: duplicate collections are not allowed")

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

pending_ids = [item["id"] for item in resources if item["review_status"] == "pending"]
if pending_ids:
    sys.exit(
        "Pending resources must remain in the issue queue, not the public catalogue: "
        + ", ".join(pending_ids)
    )

print(f"Validated {len(resources)} resources across {len(seen_ids)} unique IDs.")
