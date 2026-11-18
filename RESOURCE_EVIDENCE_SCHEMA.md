# Resource evidence and maintenance metadata

The catalogue uses explicit empty states instead of invented evidence.

- `review_record`: human content-review status, date, and review interval. A never-reviewed item is not treated as current.
- `testing`: distinguishes untested, partial, and tested resources. A tested status requires records.
- `compatibility`: dated model records with model identity and test scope.
- `expected_output`: optional example of the kind of result the resource should produce.
- `failure_modes`: known limitations or common failure patterns.
- `version_history`: concise change records for substantive revisions.
- `provenance`: origin classification and source trail.

The catalogue validator checks these structures and flags likely near-duplicates for human review. Similarity warnings are advisory; related resources must not be automatically removed.

The quality dashboard counts recorded evidence and missing records. It does not infer that a resource is good, bad, compatible, or inaccurate from empty fields.
