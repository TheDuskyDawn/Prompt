# Prompt Vault

A free, static library of reusable AI prompts and skills, designed for GitHub Pages.

## Features

- Search titles, descriptions, categories, tags, and resource content
- Filter by prompt/skill type, category, curated collection, difficulty, tag, and favourites, with one-click reset
- Sort alphabetically or by date
- Personalise fill-in fields with a live preview, then copy or download the completed prompt
- Open a resource detail view, discover related resources, copy content, or download it as a plain-text file
- Share filtered views and direct links to individual resources
- Back up favourites to JSON and restore them on another browser
- Curated collection of 20 original starter resources
- Save favourites and light/dark theme preference locally; the initial theme follows the device preference
- Offline caching through a service worker, a dedicated offline fallback page, and install metadata for supported browsers
- Retryable loading states, responsive layout, skip navigation, reduced-motion support, keyboard focus indicators, and accessible labels
- Automatically validate catalogue data, JavaScript, local links, PWA assets, and core asset-size budgets, and theme contrast, and static accessibility before deployment

## User guide

See the [online guide](https://theduskydawn.github.io/Prompt/guide.html) for search, filters, prompt personalisation, favourites, sharing, and offline use.

## Use the library

1. Open the Prompt Vault website: https://theduskydawn.github.io/Prompt/
2. Search or filter the collection.
3. Open a card to read the complete resource and copy it.
4. Mark useful resources as favourites.
5. Use Export favourites to save a backup, or Import favourites to restore one.

Favourites and theme settings stay in the current browser. They are not synced to an account or sent to a server.

## Deploy

1. In GitHub, open Settings → Pages.
2. Set the source to GitHub Actions.
3. The workflow in .github/workflows/pages.yml validates the catalogue, JavaScript, local links, and PWA assets on pull requests and pushes; it deploys only from main.

The site is static and requires no server or paid backend.

## Add a resource

Add an object to data/resources.json with these fields:

- id: unique lowercase kebab-case identifier
- type: prompt or skill
- category: category name
- title: short title (maximum 120 characters)
- description: summary (maximum 240 characters)
- tags: non-empty array of unique strings
- date: valid date in YYYY-MM-DD format
- difficulty: beginner, intermediate, or advanced
- collections: non-empty array of curated collection names
- content: resource text (maximum 12,000 characters)

The catalogue is loaded automatically; do not edit the HTML to add entries. Run python scripts/validate_catalogue.py before submitting a change.

## Local preview

Run a local static server from the repository root (for example, python -m http.server 8000) and open http://localhost:8000.

Check JavaScript syntax with node --check app.js.

See [privacy.html](https://theduskydawn.github.io/Prompt/privacy.html) for how browser storage, offline caching, and external services are handled. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md) for community and security guidance.

## Project research

See [MARKET_ANALYSIS.md](MARKET_ANALYSIS.md) for competitor patterns, positioning, and prioritised opportunities. See [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md) for submission standards.

## Contributions

Use the [resource suggestion form](https://github.com/TheDuskyDawn/Prompt/issues/new?template=resource_suggestion.yml) for new ideas, the [bug report form](https://github.com/TheDuskyDawn/Prompt/issues/new?template=bug_report.yml) for problems, or submit a pull request. Please do not include private, copyrighted, unsafe, or misleading content.
