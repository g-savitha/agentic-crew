# Changelog

All notable changes to this project are documented here.

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
