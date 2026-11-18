# Prompt Vault — 100-step roadmap

Status: [x] complete · [~] partially implemented or awaiting hands-on verification · [ ] not started

## Stage 1 — Foundation
1. [x] Define the product purpose.
2. [~] Identify primary audiences and validate their needs.
3. [x] Review competing libraries and document market positioning.
4. [x] Choose a free static architecture.
5. [x] Define the resource schema.
6. [x] Create the repository structure.
7. [x] Build the responsive site shell.
8. [x] Establish the visual design.
9. [x] Add accessible navigation and skip navigation.
10. [x] Document setup and deployment.

## Stage 2 — Catalogue
11. [x] Create original prompt entries.
12. [x] Create reusable skill entries.
13. [x] Add categories.
14. [x] Add tags.
15. [x] Add stable unique IDs.
16. [x] Separate catalogue data from the UI.
17. [x] Load JSON dynamically.
18. [x] Handle load failures and provide retry.
19. [x] Add live resource counts.
20. [x] Validate the catalogue schema.

## Stage 3 — Discovery
21. [x] Add multi-term, relevance-ranked search across resource content and metadata.
22. [x] Add resource-type filtering.
23. [x] Add category filtering.
24. [x] Add tag filtering.
25. [x] Add alphabetical and date sorting.
26. [x] Add an empty state.
27. [x] Add responsive resource cards.
28. [x] Add a resource detail dialog.
29. [x] Add copy actions with feedback and fallback.
30. [x] Add keyboard-friendly interactions, visible focus, and random-resource discovery.

## Stage 4 — Personalisation
31. [x] Add favourites.
32. [x] Persist favourites locally and remove stale IDs when the catalogue changes.
33. [x] Add a theme toggle.
34. [x] Persist the theme preference.
35. [x] Add clear feedback after copy.
36. [x] Add difficulty and collection metadata.
37. [x] Make the layout and controls responsive on mobile.
38. [x] Add visible keyboard focus states and a Ctrl/Command+K search shortcut.
39. [x] Add automated 4.5:1 text contrast checks across both themes.
40. [x] Add static accessibility checks and automated axe-core scans for library and resource dialogs; complete a manual screen-reader audit.

## Stage 5 — Quality
41. [x] Validate JSON catalogue data.
42. [x] Check unique IDs.
43. [x] Check required fields.
44. [x] Check allowed resource types and difficulty values.
45. [x] Check valid date format.
46. [x] Reject empty content and invalid metadata.
47. [x] Add CI validation.
48. [~] Exercise missing-data and network-failure cases on real devices.
49. [x] Add automated browser tests for multi-term search, relevance ranking, sorting, type/category/tag/collection/difficulty filters, empty states, review provenance, favourites backup/restore, personalisation, shareable URLs, theme persistence and device preference, offline navigation/status, downloads, keyboard interactions, random discovery, and 320px–1024px responsive page overflow.
50. [x] Implement clipboard fallback after denied modern API writes, permission-error feedback, and safe personalised input rendering.

## Stage 6 — Deployment
51. [x] Configure the GitHub Pages workflow.
52. [x] Set Pages source to GitHub Actions.
53. [x] Deploy on pushes to main.
54. [x] Scope deployment permissions.
55. [x] Add concurrency control.
56. [x] Confirm successful Pages deployment runs.
57. [x] Add .nojekyll.
58. [x] Check local asset paths in CI.
59. [x] Deploy over HTTPS.
60. [x] Document deployment.

## Stage 7 — Growth
61. [x] Create a contribution guide.
62. [x] Add resource suggestion and bug-report issue forms.
63. [x] Define content and safety guidelines.
64. [x] Automatically create and apply issue labels with a least-privilege workflow.
65. [x] Add moderation and review checks to the PR process.
66. [x] Add submission instructions.
67. [ ] Review and merge external community contributions.
68. [x] Add a changelog.
69. [ ] Create a versioned release.
70. [x] Invite feedback through GitHub Issues.

## Stage 8 — Discoverability
71. [x] Add a descriptive page title and description.
72. [x] Add social sharing metadata.
73. [x] Add a favicon and app icon.
74. [x] Add a sitemap.
75. [x] Add robots.txt.
76. [x] Improve semantic HTML structure.
77. [x] Add a canonical URL.
78. [x] Review font loading and offline fallback; Google Fonts requests use display=swap and system sans-serif fallbacks remain available offline.
79. [~] Add automated asset-size budgets and font preconnect; run a measured Lighthouse audit on mobile and desktop.
80. [~] Complete a manual accessibility audit.

## Stage 9 — Advanced options
81. [x] Evaluate a public submission path; GitHub issue forms are the current intake.
82. [x] Evaluate serverless storage; retain static JSON until demand justifies a backend.
83. [x] Evaluate authentication; accounts are not needed for the current feature set.
84. [x] Evaluate cross-device sync; local export/import is the current privacy-friendly option.
85. [x] Evaluate ratings; defer until there is enough usage and moderation capacity.
86. [x] Design a moderation queue using issue forms, pending/community/curated review states, and pull-request review.
87. [x] Evaluate analytics with privacy; no analytics or tracking are currently installed.
88. [x] Evaluate version history; Git commit history and the changelog provide the current baseline.
89. [x] Add curated collections and shareable resource links.
90. [x] Estimate hosting and maintenance costs; current static hosting has no paid backend.

## Stage 10 — Launch and maintenance
91. [x] Run an initial content review.
92. [x] Run automated local-link checks.
93. [~] Add automated 320px, 360px, 600px, 768px, 820px, and 1024px overflow coverage for the library, guide, privacy, and offline pages; complete hands-on testing on physical phones and tablets.
94. [~] Add automated Chromium browser coverage; complete hands-on desktop and cross-browser testing.
95. [~] Verify deployment from a clean, final commit and smoke-test all live assets.
96. [x] Write launch notes in the changelog.
97. [x] Publish the project overview in README.
98. [x] Collect feedback through issue forms.
99. [x] Prioritise improvements in this roadmap.
100. [ ] Schedule a quarterly roadmap review.

## Current implementation

The live catalogue contains 31 original prompts and skills across six curated collections. Implemented features include full-text search; type, category, collection, difficulty, tag, and favourites filters; related-resource recommendations; random-resource discovery; sorting; prompt personalisation; live preview; copy and text download; full catalogue JSON export; shareable filtered and individual-resource links; local favourites backup/restore; theme preference; offline caching; dedicated offline fallback page; install metadata; an offline status indicator; privacy notice; online user guide; contribution and security policies; and CI checks for catalogue data, JavaScript, local links, and PWA assets.

Automated browser coverage now includes favourites backup validation, shareable filter restoration, theme persistence, offline navigation to secondary pages, keyboard operation of the resource dialog, and skip navigation. The service worker caches each successful navigation under its own URL and falls back to the requested page before the library or offline page. The remaining work is tracked above. Accounts, ratings, and cross-device sync remain deferred because they require additional services, privacy decisions, and moderation capacity.
