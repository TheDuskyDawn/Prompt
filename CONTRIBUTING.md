# Contributing to Prompt Vault

Thanks for helping improve the library. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md), [Content Guidelines](CONTENT_GUIDELINES.md), [Resource Review Checklist](RESOURCE_REVIEW_CHECKLIST.md), and [Security Policy](SECURITY.md).

## Suggesting a resource
Open a GitHub Issue and include:
- A clear title and category
- Whether it is a prompt or a reusable skill
- A short description of the intended result
- The complete resource text
- Useful tags and any limitations

Do not include personal information, confidential data, copyrighted text you do not have permission to share, or unsafe instructions.

## Submitting a change
1. Fork the repository.
2. Add or edit an entry in `data/resources.json`.
3. Keep IDs unique and use lowercase kebab-case IDs.
4. Keep content clear, original, and broadly useful.
5. Set `review_status` to `pending` for a new contribution; only maintainers should change it to `curated` or `community` after review.
6. Run `python scripts/validate_catalogue.py`.
7. Run `node --check app.js` and `node --check service-worker.js`.
8. Run `python scripts/check_links.py` and `python scripts/check_pwa.py`.
9. Open a pull request describing what changed and how it was checked.

Maintainers may edit, decline, or remove submissions to protect quality and safety.