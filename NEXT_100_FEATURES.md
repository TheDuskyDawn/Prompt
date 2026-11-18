# Prompt Vault — Next 100 feature plan

**Scope:** Features 101–200, following the original 100-step foundation roadmap.  
**Planning date:** 18 November 2026  
**Principle:** Keep the product static, free, portable, and privacy-friendly by default. A backend, accounts, payments, or model API calls are separate investment decisions, not assumed prerequisites.

## Priority legend

- **P0:** Foundational next-wave work; do first.
- **P1:** High-value improvements after the foundations are in place.
- **P2:** Exploratory or later-stage improvements; validate demand before building.

## Delivery rules

1. Ship in small, independently useful increments; do not create a 100-feature monolith.
2. Keep catalogue JSON as the source of truth and preserve backwards-compatible exports.
3. Every new resource must pass originality, safety, rights, quality, and provenance review.
4. Do not add accounts, cloud sync, payments, or third-party API costs without user research and a privacy/security design.
5. Do not claim model compatibility unless a dated test record supports it.
6. Every feature needs an owner, acceptance criteria, and a documented rollback path before implementation.
7. Browser tests are paused by request during this planning phase; implementation work should resume only when explicitly requested.

## The 100 features

### Stage 1 — Trust, quality, and provenance

101. [x] [P0] Add a structured quality rubric covering clarity, completeness, usefulness, originality, and limitations. **Implemented on the planning branch; existing resources remain unassessed until a human review is recorded.**
102. [x] [P0] Add per-resource review dates and automatic stale-review flags. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**
103. [x] [P0] Add explicit tested/not-tested status separate from editorial curation. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**
104. [x] [P0] Add model compatibility records with model name, version, date, and test scope. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**
105. [x] [P0] Add expected-output examples for resources where examples improve understanding. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**
106. [x] [P0] Add failure-mode notes describing common ways a prompt can go wrong. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**
107. [x] [P1] Add resource version history with concise change summaries. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**
108. [x] [P1] Add source/provenance fields for references and inspiration, without copying third-party prompts. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**
109. [x] [P1] Add duplicate and near-duplicate detection to catalogue validation. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**
110. [x] [P1] Add a quality-review dashboard generated from the JSON catalogue. **Metadata, validation, and interface support implemented; resource-specific evidence remains blank until documented.**

### Stage 2 — Better discovery and navigation

111. [x] [P0] Add a dedicated browse-by-task landing page. **Implemented on the planning branch.**
112. [x] [P0] Add audience filters such as learner, educator, developer, researcher, and creator. **Implemented on the planning branch.**
113. [x] [P0] Add input/output format filters such as text, table, JSON, checklist, and code. **Implemented on the planning branch.**
114. [x] [P1] Add estimated completion-time metadata and filtering. **Implemented on the planning branch.**
115. [x] [P1] Add resource prerequisites and prerequisite-aware recommendations. **Implemented on the planning branch.**
116. [x] [P1] Add saved search presets in browser storage. **Implemented on the planning branch.**
117. [x] [P1] Add search suggestions and typo-tolerant matching. **Implemented on the planning branch.**
118. [x] [P1] Add a recently viewed list stored locally. **Implemented on the planning branch.**
119. [x] [P1] Add a compare-resources view for side-by-side metadata and use cases. **Implemented on the planning branch.**
120. [x] [P2] Add curated seasonal/topic collections with review dates and expiry rules. **Implemented on the planning branch.**

### Stage 3 — Prompt builder and authoring tools

121. [P0] Add a guided prompt builder with goal, context, constraints, and output format fields.
122. [P0] Add reusable variable types: short text, long text, number, date, and select.
123. [P0] Add required/optional variable validation and helpful inline hints.
124. [P1] Add conditional sections that appear only when selected inputs require them.
125. [P1] Add a structured output-format builder for tables, JSON, and checklists.
126. [P1] Add prompt length and readability indicators.
127. [P1] Add a side-by-side original and personalised prompt comparison.
128. [P1] Add reusable local variable profiles for recurring non-sensitive projects.
129. [P2] Add a prompt linting checklist for ambiguity, missing context, and conflicting instructions.
130. [P2] Add export of a completed prompt-builder template as portable JSON.

### Stage 4 — Learning and onboarding

131. [P0] Add a beginner learning path explaining prompt structure.
132. [P0] Add short lessons on context, constraints, examples, and output formats.
133. [P0] Add interactive exercises using safe, fictional practice scenarios.
134. [P1] Add before/after examples that explain why a revision is clearer.
135. [P1] Add a glossary of prompt-engineering terms.
136. [P1] Add role-based learning tracks for students, educators, developers, and researchers.
137. [P1] Add progress tracking stored only in the visitor's browser.
138. [P1] Add printable lesson notes and accessible text-only versions.
139. [P2] Add knowledge checks with explanations, not just scores.
140. [P2] Add a contributor learning path covering originality, testing, attribution, and safe publishing.

### Stage 5 — Workflows and reusable skills

141. [P0] Add a workflow resource type with numbered, inspectable steps.
142. [P0] Add workflow input/output contracts and required materials.
143. [P1] Add workflow dependency graphs for multi-step resources.
144. [P1] Add reusable checklists that can be copied or downloaded.
145. [P1] Add workflow bundles grouped by a complete task, not just topic.
146. [P1] Add clear human-review checkpoints for consequential outputs.
147. [P1] Add pause/resume notes so users can continue a multi-step workflow later.
148. [P2] Add export of workflows as Markdown and JSON.
149. [P2] Add workflow templates for common learning and project-planning tasks.
150. [P2] Add a safe workflow preview that shows all steps before copying.

### Stage 6 — Portability, offline use, and accessibility

151. [P0] Add schema-versioned catalogue exports with migration notes.
152. [P0] Add import preview showing additions, updates, duplicates, and rejected records.
153. [P1] Add one-click export of a selected collection.
154. [P1] Add one-click export of a single resource as Markdown and JSON.
155. [P1] Add offline search index generation and validation.
156. [P1] Add a storage-status panel explaining what remains on the device.
157. [P1] Add a keyboard shortcuts help dialog and printable shortcut sheet.
158. [P1] Add language-aware font and layout checks for future translations.
159. [P2] Add a low-bandwidth mode with reduced decorative assets.
160. [P2] Add a full accessibility review with keyboard, screen-reader, zoom, and reduced-motion checklists.

### Stage 7 — Community contribution and governance

161. [P0] Improve the issue form with a guided resource-submission template.
162. [P0] Add a public contribution status guide: received, reviewing, changes requested, accepted, declined.
163. [P0] Add a contributor checklist for originality, rights, safety, and evidence.
164. [P1] Add a maintainer triage template that scores usefulness and review effort.
165. [P1] Add a public changelog of accepted community contributions.
166. [P1] Add contributor attribution preferences with clear consent.
167. [P1] Add a correction/report-an-issue action on each resource.
168. [P1] Add a transparent appeal/reconsideration path for declined submissions.
169. [P2] Add a rotating community spotlight only for fully reviewed resources.
170. [P2] Add contribution metrics that count accepted work without ranking people by popularity.

### Stage 8 — Model compatibility and integrations

171. [P0] Add a maintained model directory with provider, family, and retirement status.
172. [P0] Add a model-agnostic baseline version for every resource where possible.
173. [P1] Add optional model-specific variants with separate review records.
174. [P1] Add provider capability notes for context length, structured output, and tool support when sourced.
175. [P1] Add a compatibility warning when a resource targets a retired or changed model.
176. [P1] Add copy-format options for common chat interfaces and plain text.
177. [P2] Add optional links to official model documentation for each compatibility record.
178. [P2] Add an opt-in local comparison worksheet for users to evaluate outputs themselves.
179. [P2] Evaluate a privacy-preserving browser extension only after usage research justifies maintenance cost.
180. [P2] Evaluate optional API-based testing only with explicit user consent, clear costs, and secret-handling safeguards.

### Stage 9 — Feedback and product research

181. [P0] Add a voluntary usefulness rating with no account required.
182. [P0] Add structured feedback reasons: unclear, outdated, incomplete, inaccurate, or useful.
183. [P1] Add an optional anonymous feedback form that collects no prompt contents by default.
184. [P1] Add a maintainer report summarising feedback themes from submitted issues.
185. [P1] Add a lightweight user-research page with clear purpose and consent.
186. [P1] Add a public roadmap status legend distinguishing shipped, planned, and experimental.
187. [P2] Add a quarterly review of the top search terms only if privacy-safe aggregate data is available.
188. [P2] Add a catalogue coverage map to identify under-served task categories.
189. [P2] Add an experiment log for feature changes and their measured outcomes.
190. [P2] Add a public decision log explaining why major features are built, deferred, or rejected.

### Stage 10 — Reliability, security, and operations

191. [P0] Add a documented threat model for static content, imports, links, and service-worker caching.
192. [P0] Add dependency update policy and a periodic dependency audit.
193. [P0] Add a content-security policy after validating all inline scripts/styles and third-party dependencies.
194. [P1] Add automated link freshness checks with a human review queue for failures.
195. [P1] Add a release checklist with rollback instructions and a verified deployment record.
196. [P1] Add build metadata showing catalogue version and last successful deployment.
197. [P1] Add a browser support policy and test matrix for Chromium, Firefox, and WebKit.
198. [P1] Add performance budgets for images, scripts, styles, and total transfer size.
199. [P2] Add a maintainer handover guide covering access, releases, moderation, and incident response.
200. [P2] Run a six-month strategy review against user evidence, maintenance cost, and competitor changes.

## Suggested delivery sequence

| Wave | Features | Main outcome |
|---|---:|---|
| 1 | 101–110 | Trust, testing provenance, and content quality |
| 2 | 111–120 | Better task-based discovery |
| 3 | 121–130 | Reusable prompt authoring and linting |
| 4 | 131–140 | Learning paths and onboarding |
| 5 | 141–150 | Multi-step workflows and skills |
| 6 | 151–160 | Portability, offline, and accessibility |
| 7 | 161–170 | Governed community contributions |
| 8 | 171–180 | Model awareness and carefully gated integrations |
| 9 | 181–190 | Feedback and evidence-led prioritisation |
| 10 | 191–200 | Security, reliability, operations, and strategy |

## First 10 recommended builds

1. **101 — Quality rubric:** define what a good resource means before increasing catalogue size.
2. **102 — Review freshness:** prevent old content from looking permanently current.
3. **103 — Tested status:** separate human editorial review from actual model testing.
4. **104 — Compatibility records:** record which models were checked and when.
5. **105 — Expected outputs:** make resource outcomes easier to judge.
6. **106 — Failure modes:** explain limits instead of promising perfect results.
7. **111 — Browse by task:** organise around what a visitor wants to accomplish.
8. **121 — Guided prompt builder:** help visitors create their own structured prompts.
9. **131 — Beginner learning path:** teach reusable prompting principles, not only copying.
10. **141 — Workflow resource type:** make multi-step skills first-class catalogue items.

## Success measures

- Quality: percentage of catalogue entries with a current review date, clear limitations, and complete metadata.
- Trust: percentage of model-specific claims backed by dated test records.
- Usefulness: voluntary visitor feedback and issue themes, not raw page views alone.
- Learning: completion of optional lessons and self-reported confidence, stored locally unless users explicitly submit feedback.
- Portability: successful export/import round trips across schema versions.
- Accessibility: no critical/serious automated findings plus completed manual keyboard and screen-reader review.
- Sustainability: maintainers can update, review, and deploy without paid services or fragile manual steps.

## Explicitly deferred

Paid prompt marketplace, creator payouts, advertising, compulsory accounts, cross-device cloud sync, public comments, popularity leaderboards, and unrestricted automatic prompt publishing. These introduce operational, privacy, moderation, or financial complexity and are not necessary to validate Prompt Vault's differentiated value.
