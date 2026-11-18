# Resource review checklist

Use this checklist when reviewing a proposed prompt or skill before adding it to the public catalogue.

## Purpose and usefulness
- [ ] The resource solves one clear, useful task.
- [ ] The title and description accurately describe its purpose.
- [ ] The content gives enough context to produce a useful result.
- [ ] Placeholders are clear, unique, and explained by their names.
- [ ] Expected output and any important limitations are stated.
- [ ] The resource is meaningfully different from existing entries.

## Quality and metadata
- [ ] The ID is unique and uses lowercase kebab-case.
- [ ] The type is prompt or skill.
- [ ] The category and tags are relevant.
- [ ] Difficulty reflects the knowledge needed, not the user's worth or ability.
- [ ] At least one existing curated collection is appropriate.
- [ ] The date is valid and the content fits the field limits.

## Safety, privacy, and rights
- [ ] The content does not facilitate harm or unsafe activity.
- [ ] It does not ask users to disclose passwords, private keys, or unnecessary personal information.
- [ ] It does not contain confidential or identifying information.
- [ ] It is original or the submitter has permission to share it.
- [ ] It does not include lengthy copyrighted passages or copied prompt packs.
- [ ] High-impact claims are appropriately qualified and require suitable human review.

## Technical checks
- [ ] The catalogue validator passes.
- [ ] JavaScript syntax, local-link, PWA, performance, contrast, and accessibility checks pass.
- [ ] The resource renders correctly in the detail view.
- [ ] Placeholder personalisation, copy, and download work where applicable.
- [ ] The change is understandable on a narrow mobile screen.

A resource should not be merged until every applicable item is checked. If an item cannot be verified, explain the limitation in the pull request.

## Review status

- Set `review_status` to `curated`, `community`, or `pending` in the catalogue.
- Use `curated` only after the resource has passed the checks above.
- Keep unreviewed submissions out of the public catalogue; `community` is for accepted community-authored entries that have passed review, not a bypass for review.
- Never label a resource `curated` merely because it is original; verify usefulness, safety, clarity, and accuracy first.
