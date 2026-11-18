import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "scripts" / "validate_catalogue.py"
CATALOGUE = ROOT / "data" / "resources.json"


class CatalogueReviewStatusTests(unittest.TestCase):
    def run_validator(self, status_override=None):
        resources = json.loads(CATALOGUE.read_text(encoding="utf-8"))
        if status_override is not None:
            for item in resources:
                item["review_status"] = status_override

        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary)
            (project / "scripts").mkdir()
            (project / "data").mkdir()
            shutil.copy2(VALIDATOR, project / "scripts" / "validate_catalogue.py")
            (project / "data" / "resources.json").write_text(
                json.dumps(resources), encoding="utf-8"
            )
            return subprocess.run(
                [sys.executable, "scripts/validate_catalogue.py"],
                cwd=project,
                capture_output=True,
                text=True,
                check=False,
            )

    def test_current_curated_catalogue_passes(self):
        result = self.run_validator()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_pending_resources_are_rejected_from_public_catalogue(self):
        result = self.run_validator("pending")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("must remain in the issue queue", result.stderr)

    def test_accepted_community_resources_are_allowed(self):
        result = self.run_validator("community")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_unknown_review_status_is_rejected(self):
        result = self.run_validator("unreviewed")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("review_status must be curated, community, or pending", result.stderr)


if __name__ == "__main__":
    unittest.main()
