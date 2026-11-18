# Prompt Vault quality rubric

**Rubric version:** 1.0  
**Purpose:** Consistent editorial assessment of catalogue resources. This is a review aid, not a guarantee that a prompt will produce correct outputs.

## Scoring scale

Score each dimension from 1 to 5. Use whole numbers only.

| Score | Meaning |
|---:|---|
| 1 | Serious gap; the resource is not ready to publish |
| 2 | Material weaknesses; substantial revision is needed |
| 3 | Adequate; usable, with identifiable improvements |
| 4 | Strong; clear and useful with only minor gaps |
| 5 | Excellent; unusually clear, complete, and well-scoped |

## Dimensions

1. **Clarity:** Is the task understandable? Are instructions and placeholders unambiguous?
2. **Completeness:** Does it include the context, constraints, steps, and output expectations needed for the stated task?
3. **Usefulness:** Would the resource help its intended audience complete a real, well-defined task?
4. **Originality:** Is the wording and structure original, distinct from existing catalogue entries, and free of copied third-party material?
5. **Limitations:** Are uncertainty, assumptions, failure modes, and boundaries made clear where they matter?

## Review procedure

1. Read the resource as a first-time user and identify its intended task and audience.
2. Score all five dimensions independently; do not infer a score from the resource's popularity or length.
3. Add concise evidence-based notes, especially for any score below 3.
4. Check safety, privacy, accessibility, factual accuracy, and rights separately using the [resource review checklist](RESOURCE_REVIEW_CHECKLIST.md). A high rubric score does not override a safety or rights failure.
5. Record the review date and rubric version. Re-review after substantive content changes.
6. Keep a resource marked `not-assessed` until a human has completed and recorded all five scores. Do not invent scores or treat automated validation as editorial review.

## Publication interpretation

- **Not assessed:** No complete rubric assessment is recorded.
- **Assessed:** All five dimension scores, reviewer, date, and notes are recorded.
- **Needs revision:** One or more dimensions score 1 or 2, or the reviewer identifies a blocking issue.
- **Ready:** All dimensions score at least 3 and all separate safety, rights, and technical checks pass.

A score is not a model test. Use separate dated compatibility/test records before claiming that a resource has been tested on a particular model.

## Catalogue record

Each resource may include a `quality_review` object:

```json
{
  "rubric_version": "1.0",
  "status": "not-assessed",
  "scores": null,
  "reviewer": null,
  "reviewed_at": null,
  "notes": ""
}
```

For a completed assessment, `scores` must contain integer values from 1 to 5 for `clarity`, `completeness`, `usefulness`, `originality`, and `limitations`. The record must also include a non-empty reviewer, a valid `YYYY-MM-DD` review date, and notes. Set status to `assessed`, `needs-revision`, or `ready` according to the publication interpretation above.

**Current rollout:** Existing catalogue entries are explicitly marked `not-assessed`. This avoids retroactively claiming that an undocumented review took place.
