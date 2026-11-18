# Prompt Vault

A free, static library of reusable AI prompts and skills, designed for GitHub Pages.

## Features

- Search titles, descriptions, categories, tags, and resource content
- Filter by prompt/skill type, category, tag, and favourites
- Sort alphabetically or by date
- Open a resource detail view and copy its content
- Back up favourites to JSON and restore them on another browser
- Curated collection of 15 original starter resources
- Save favourites and light/dark theme preference locally
- Responsive layout, keyboard focus indicators, and accessible labels
- Automatically validate catalogue data and JavaScript syntax before deployment

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
3. The workflow in .github/workflows/pages.yml validates the catalogue and JavaScript, then deploys after pushes to main.

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
- content: resource text (maximum 12,000 characters)

The catalogue is loaded automatically; do not edit the HTML to add entries. Run python scripts/validate_catalogue.py before submitting a change.

## Local preview

Run a local static server from the repository root (for example, python -m http.server 8000) and open http://localhost:8000.

Check JavaScript syntax with node --check app.js.

## Contributions

Use GitHub Issues for suggestions or submit a pull request. Please do not include private, copyrighted, unsafe, or misleading content.
