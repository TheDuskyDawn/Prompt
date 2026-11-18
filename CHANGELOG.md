# Changelog

Notable project changes are recorded here.

## 2026-11-18

- Launched the first GitHub Pages deployment.
- Added catalogue search, category/type/tag filters, sorting, resource details, and copy.
- Added browser-local favourites and theme preference.
- Added favourites-only filtering and JSON import/export for favourites.
- Expanded the curated collection to 25 original prompts and skills.
- Improved keyboard focus, selected-state labels, and clipboard fallback behaviour.
- Strengthened catalogue validation and added JavaScript syntax and local-link checks to CI.
- Added shareable filtered views and direct links to individual resources.
- Added plain-text downloads for individual prompts and skills.
- Added difficulty metadata and a difficulty filter with shareable URL state.
- Added five curated collections and a collection filter.
- Added a one-click reset for all library filters.
- Added a web app manifest and offline caching service worker.
- Added pull-request validation, PWA checks, and a reviewer checklist.
- Added a public privacy notice and checks for its local links.
- Added fill-in fields that personalise prompts with a live preview before copying or downloading.
- Added market analysis and positioning recommendations.
- Added retryable loading states, resilient local storage, skip navigation, and reduced-motion support.

- Added automated issue label creation and assignment.

- Added CI performance budgets for core text assets and font preconnect hints.

- Added automated text contrast checks for both color themes and improved light-theme accent contrast.

- Added static accessibility checks for page language, headings, IDs, labels, skip navigation, and dialog naming.

- Added related-resource recommendations based on shared collections and tags.

- Respect the device color-scheme preference when no theme choice has been saved.

- Added direct links to resource suggestion and bug report forms on the site.

- Added an online user guide and included it in offline caching and automated checks.

- Added a cached offline fallback page for navigation failures.

- Added a detailed resource review checklist for maintainers and contributors.

- Added a one-click JSON export of the complete resource catalogue.

- Added Playwright browser tests for catalogue loading, search, filters, favourites, prompt personalisation, direct links, downloads, mobile overflow, and offline navigation.
- Fixed offline navigation so each successfully visited page is cached under its own URL, with a page-specific offline fallback before the library fallback.
- Added browser regression coverage for invalid favourites imports, unfilled placeholders, clearing filters, unknown resource links, keyboard dialog operation, skip navigation, theme persistence, and offline guide navigation.
- Expanded the QA roadmap to distinguish automated coverage from remaining hands-on device and cross-browser checks.
- Delay revoking the favourites-export object URL until the browser has had time to begin the download.
- Verify keyboard focus returns to the invoking resource card after the detail dialog closes, and reject oversized favourites backups without changing saved data.
- Added explicit review-status metadata to every catalogue entry, validated it in CI, and surfaced provenance in resource cards and details.
