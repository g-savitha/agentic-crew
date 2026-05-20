# Changelog

All notable changes to this project are documented here.

> **Note:** Sections for releases before **1.0.2** describe history as-shipped (e.g. external theme packs in 1.0.0 were removed in 1.0.2). Current behavior is defined by the latest release section and `docs/SCHEMA.md`.

## [1.0.3] - 2026-05-20

### Changed

- Init questionnaire preview lists **preset-filtered** core agents (not all 13 when `startup` is selected)
- Post-init CLI summary: phoenix theme closes with **Mischief managed.**; utilities show `/team` and `/lumos` only
- **`/setup`** documented and templated as **repair-only** (init already scaffolds `.agent/`)
- README polished for npm (professional tone, post-init flow, comparison section)

### Fixed

- Init summary **Core team** section respects preset exclusions (was labeling all default agents as included)

## [1.0.2] - 2026-05-20

### Added

- **`.agent/reports/retro.md`** starter scaffold (Scrum retrospective protocol)
- **`doctor --strict`** validates agent status frontmatter, manifest roster vs stacks/preset, catalog vs roster, and `retro.md`
- **`src/catalog.js`** — `validateCatalogContent()` for `/lumos` and `/help` roster checks
- **`documentationInbox`** — lean presets route doc handoffs to `staff-engineer` when Documentation is excluded
- README section: **vs CrewAI / LangGraph**
- Windsurf scaffold test; extended CLI e2e (`--strict`, config-driven init)
- Synced **`index.d.ts`** with public API (`validateCatalogContent`, `resolveCatalogAgentGroups`, `documentationInboxFor`, `applyThemePack`, …)

### Changed

- Built-in themes only: **`phoenix`** and **`professional`** (no custom npm theme packs yet)
- README hero copy: you invoke the team; no implied autonomous execution
- **Presets control roster only** — `theme` comes from `--theme` / config (defaults to `phoenix`); presets no longer force `professional`
- **`/lumos` and `/help`** list only agents on the active preset roster (not the full default table)
- Manifest migrations: missing `preset` → `startup` (was `full`)
- Init summary: character/alias columns use ` · ` separator (fixes cramped `dumbledoreor` display)

### Fixed

- Catalog listed agents (e.g. `/cedric`, `/documentation`) that were not scaffolded under `startup` preset
- Scaffolder wrote full default roster while manifest said `startup` when `presetExcludeFiles` was omitted
- `doctor --fix` / `/setup` did not create `retro.md`; setup template now includes retro bootstrap
- `doctor` validates catalog content against expected roster; checks `expectedAgents` for status/skills
- `examples/hello-team/` aligned (`theme: phoenix`, filtered `lumos`, `documentationInbox` in skills)
- Cross-agent templates referenced `.agent/messages/documentation.md` on teams without a Documentation agent

### Removed

- `packages/theme-sample`, `src/theme-loader.js`, and related tests/docs

## [1.0.1] - 2026-05-20

### Fixed

- `doctor --strict` now errors on missing starter runbooks and missing `security.yml` when expected
- Custom roles respect external theme packs via `applyTheme()` (no stray character aliases)
- `docs/SCHEMA.md` stable release line updated to 1.0.x
- CI runs `doctor --strict` on smoke install; `test:smoke` uses isolated `--output-dir`

### Changed

- IDE tests split: codex/AGENTS.md always runs; cursor-only test skips on sandbox EPERM
- Tests for strict runbook checks and `update` backfilling missing runbooks

## [1.0.0] - 2026-05-20

### Added

- **`@agentic-crew/theme-sample`** — publishable reference theme in `packages/theme-sample/`
- External theme integration in templates (`/team`, `AGENTS.md`, cursor rule) via `resolveThemePack`
- Tests for sample theme loading and scaffold output

### Changed

- **npm 1.0.0** — stable product release after v0.8 hardening
- Manifest schema: `theme` and `catalogCommand` accept any string (external theme ids)
- CLI accepts `--theme <id>` when a matching theme pack is installed
- `doctor` manifest repair uses `startup` preset fallback (aligned with new installs)

### Fixed

- External themes were rejected by CLI (`THEMES` enum) and rendered with wrong catalog/start commands
- `pruneStaleFiles` uses manifest `catalogCommand` for external themes

## [0.8.0] - 2026-05-20

### Added

- **Starter runbooks** on init: `docs/runbooks/release.md`, `on-call.md`, `incident.md`
- **Heartbeat validation** in `doctor` with `--strict` (structured YAML frontmatter)
- **`doctor --prune`** — opt-in stale file removal with `--fix` (default fix no longer prunes)
- **README**: limitations, 5-minute walkthrough, YAML config constraints
- **Dogfood**: `.agent/` backlog on this repo; `examples/hello-team/` consumer example
- **CONTRIBUTING.md** with PR and release checklists
- **`src/heartbeat.js`** and **`src/runbooks.js`** utilities

### Changed

- **Default preset** is `startup` (CLI, questionnaire, config merge) for new installs
- **`.agent/README.md` protocol** — heartbeat is overwrite snapshot; other reports may append
- **SECURITY.md** supported versions updated for 0.7.x / 0.8.x
- **External theme packs** documented as experimental in `docs/SCHEMA.md`
- Scrum/setup skills aligned with structured heartbeat format

### Fixed

- Contradictory heartbeat append vs overwrite guidance across agent templates
- DevOps/SRE skills referenced runbooks that were not scaffolded (only `.gitkeep`)
- `doctor --fix` no longer prunes stale files unless `--prune` is passed

## [0.7.0] - 2026-05-19

### Added

- **External theme loader** (`loadThemePack`) — resolve `@agentic-crew/theme-*` packages from `node_modules`
- **Schema v1 documentation** — `docs/SCHEMA.md` and stable manifest contract for 0.7.x

## [0.6.0] - 2026-05-19

### Added

- **Manifest migrations** on `update` — backfill `schemaVersion`, `commandHashes`, `preset`, `supplementaryFiles`
- **Update dry-run diff** — `update --dry-run` lists files that would update vs preserve (with reasons)
- **`--with-gitignore`** on `init` — append recommended `.gitignore` snippet for backups and optional message history

## [0.5.0] - 2026-05-19

### Added

- **TypeScript declarations** (`index.d.ts`) — types for programmatic API consumers
- **Doctor supplementary checks** — validates `team.md` per command dir and manifest `supplementaryFiles`
- **Example config** — `examples/agentic-crew.yaml.example`

## [0.4.0] - 2026-05-19

### Added

- **Config files**: `.agentic-crew.yaml`, `.agentic-crew.config.json` — auto-loaded on init; `--config` and `--save-config`
- **IDE targets**: `codex` (`.codex/skills/`), `windsurf` (`.windsurf/workflows/`), `all` (every target)
- **Supplementary outputs**: root `AGENTS.md` (Codex/universal), `.cursor/rules/agentic-crew.mdc` (when Cursor selected)
- **`/team` router command** — single entry point: `/team <agent> <task>`
- **`startup` preset** — professional theme, lean delivery roster
- **Theme packs** (`src/themes/`) — persona layer separated from core agent protocol
- **Structured heartbeat schema** — YAML frontmatter with blockers, decisions_needed, accomplishments

### Changed

- `--target` accepts `claude | cursor | codex | windsurf | both | all`
- Manager skill documents structured heartbeat format

## [0.3.0] - 2026-05-19

### Added

- Public programmatic API via `require('agentic-crew')` (`src/api.js`) with `exports` map
- Manifest `schemaVersion` and JSON Schema at `schema/manifest.schema.json`
- Stale file pruning on `update` and `init --force` (orphan commands, status, messages)
- `agentic-crew uninstall` with `--keep-state` and `--dry-run`
- `agentic-crew doctor --fix` to repair missing scaffold files
- `agentic-crew update --dry-run` to preview changes and stale file removal
- `--json` output on `init`, `doctor`, `update`, and `uninstall`
- `--preset full|minimal|enterprise` for lean rosters (enterprise defaults to professional theme)
- Doctor: hash drift warnings, message frontmatter validation, manifest structure checks
- npm package metadata (`repository`, `bugs`, `homepage`) and publish workflow with provenance

### Fixed

- `update --force` now correctly controls docs/backlog overwrite (default update preserves them)
- Multiple custom domain labels are combined into one domain-expert agent
- Removed unsupported `codex` keyword from npm package metadata

### Changed

- `main` entry point is the public API (`src/api.js`); CLI remains `agentic-crew` bin
- Bumped version to 0.3.0

## [0.2.1] - 2026-05-19

### Security

- Sanitize user-provided project metadata before template rendering
- Bound `--output-dir` to the current working directory
- Document pinned installs and add `SECURITY.md`
- Add `npm audit` and Dependabot to CI
- Optional `--with-security-ci` scaffolds a GitHub security workflow in target projects

### Added

- Command file content hashes in `.agentic-crew.json` for safe updates
- `agentic-crew update --force-overwrite` to replace user-edited skill files
- `agentic-crew update --backup` to copy prior command files before updating
- `--custom-role` CLI flag (`Name|Description`, repeatable)
- Doctor checks: package version drift, alias stubs, custom role skills
- Golden-file and regression tests for scaffold output and safety utilities

### Changed

- `update` preserves user-edited command files unless `--force-overwrite` is set
- README recommends pinned `npx agentic-crew@version` installs
- `PACKAGE_VERSION` read from `package.json` (single source of truth)
- Removed inappropriate characters from custom-role persona pool

## [0.2.0] - prior release

- Multi-domain agents, professional theme, role briefs, doctor/update commands
