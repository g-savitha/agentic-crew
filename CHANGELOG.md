# Changelog

All notable changes to this project are documented here.

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
