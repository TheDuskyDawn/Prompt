from pathlib import Path
import sys

BUDGETS = {
    "index.html": 18_000,
    "styles.css": 32_000,
    "app.js": 32_000,
    "service-worker.js": 8_000,
    "data/resources.json": 100_000,
    "manifest.webmanifest": 4_000,
}
failures = []
total = 0

for filename, budget in BUDGETS.items():
    path = Path(filename)
    if not path.is_file():
        failures.append(f"Missing performance-budget file: {filename}")
        continue
    size = path.stat().st_size
    total += size
    if size > budget:
        failures.append(f"{filename} is {size:,} bytes; budget is {budget:,} bytes")
    else:
        print(f"{filename}: {size:,} / {budget:,} bytes")

total_budget = 180_000
if total > total_budget:
    failures.append(f"Core text assets total {total:,} bytes; budget is {total_budget:,} bytes")
else:
    print(f"Core text assets total: {total:,} / {total_budget:,} bytes")

if failures:
    sys.exit("\n".join(failures))
