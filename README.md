# Prompt Vault

A free, static library of reusable AI prompts and skills, designed for GitHub Pages.

## Features
- Search by title, description, category, and tags
- Filter by resource type, category, and tag
- Sort resources alphabetically or by date
- Copy prompt/skill content
- Local favourites and light/dark theme preference
- Responsive layout and accessible controls

## Deploy
1. In GitHub, open **Settings → Pages**.
2. Set the source to **GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` deploys the site after pushes to `main`.

The site is static and requires no server or paid backend.

## Add a resource
Edit `data/resources.json` and add an object with unique `id`, `type` (prompt or skill), `category`, `title`, `description`, `tags` (array), `date` (YYYY-MM-DD), and `content`. The catalogue is loaded automatically; do not edit the HTML to add entries.

## Local preview
Run a local static server from the repository root (for example, `python -m http.server 8000`) and open `http://localhost:8000`.

## Contributions
Use GitHub Issues for suggestions or submit a pull request. Please do not include private, copyrighted, unsafe, or misleading content.