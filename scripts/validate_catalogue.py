import json
import re
from difflib import SequenceMatcher
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
        if not isinstance(quality.get("reviewed_at"), str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", quality["reviewed_at"]):
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

    review_record = item.get("review_record")
    if not isinstance(review_record, dict) or review_record.get("status") not in {"not-reviewed", "current", "stale"}:
        sys.exit(f"{prefix}: invalid review_record")
    if review_record.get("status") == "not-reviewed" and review_record.get("reviewed_at") is not None:
        sys.exit(f"{prefix}: not-reviewed records cannot have reviewed_at")
    if type(review_record.get("review_interval_days")) is not int or review_record["review_interval_days"] < 1:
        sys.exit(f"{prefix}: review_interval_days must be a positive integer")
    if review_record.get("reviewed_at") is not None:
        try:
            date.fromisoformat(review_record["reviewed_at"])
        except (TypeError, ValueError):
            sys.exit(f"{prefix}: reviewed_at must be a valid YYYY-MM-DD date")

    testing = item.get("testing")
    if not isinstance(testing, dict) or testing.get("status") not in {"untested", "tested", "partial"}:
        sys.exit(f"{prefix}: invalid testing status")
    if not isinstance(testing.get("records"), list):
        sys.exit(f"{prefix}: testing.records must be an array")
    if testing["status"] == "untested" and testing["records"]:
        sys.exit(f"{prefix}: untested resources cannot contain test records")

    if not isinstance(item.get("compatibility"), list):
        sys.exit(f"{prefix}: compatibility must be an array")
    for record in item["compatibility"]:
        if not isinstance(record, dict) or not all(isinstance(record.get(key), str) and record[key].strip() for key in ("model", "tested_at", "scope")):
            sys.exit(f"{prefix}: compatibility records require model, tested_at, and scope")
        try:
            date.fromisoformat(record["tested_at"])
        except ValueError:
            sys.exit(f"{prefix}: compatibility tested_at must be a valid date")

    if item.get("expected_output") is not None and not isinstance(item["expected_output"], str):
        sys.exit(f"{prefix}: expected_output must be text or null")
    if not isinstance(item.get("failure_modes"), list) or any(not isinstance(x, str) or not x.strip() for x in item["failure_modes"]):
        sys.exit(f"{prefix}: failure_modes must be an array of non-empty strings")
    if not isinstance(item.get("version_history"), list):
        sys.exit(f"{prefix}: version_history must be an array")
    provenance = item.get("provenance")
    if not isinstance(provenance, dict) or provenance.get("kind") not in {"original", "adapted", "third-party-permission"}:
        sys.exit(f"{prefix}: invalid provenance record")
    if not isinstance(provenance.get("sources"), list) or any(not isinstance(x, str) or not x.strip() for x in provenance["sources"]):
        sys.exit(f"{prefix}: provenance.sources must be an array of non-empty strings")

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

# Flag likely duplicates for human review; do not auto-delete or reject near matches.
normalised = []
for item in resources:
    text_value = re.sub(r"\\s+", " ", (item["title"] + " " + item["content"]).lower()).strip()
    normalised.append((item["id"], text_value))
duplicate_warnings = []
for index, (left_id, left_text) in enumerate(normalised):
    for right_id, right_text in normalised[index + 1:]:
        similarity = SequenceMatcher(None, left_text, right_text, autojunk=False).ratio()
        if similarity >= 0.90:
            duplicate_warnings.append(f"{left_id} ~ {right_id} ({similarity:.0%})")
print(f"Validated {len(resources)} resources across {len(seen_ids)} unique IDs.")
if duplicate_warnings:
    print("Possible near-duplicates for human review:")
    for warning in duplicate_warnings:
        print(f" - {warning}")
