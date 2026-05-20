# Contributing to agentic-crew

Thank you for helping improve the CLI and agent team templates.

## Development setup

```bash
git clone https://github.com/g-savitha/agentic-crew.git
cd agentic-crew
npm ci
npm test
```

## What to change where

| Area | Location |
|------|----------|
| Agent skill templates | `src/templates/commands/*.md.hbs` |
| Shared protocol | `src/templates/agent/*.md.hbs`, `src/templates/partials/` |
| CLI commands | `src/index.js`, `bin/cli.js` |
| Scaffold logic | `src/scaffolder.js`, `src/runbooks.js` |
| Validation | `src/doctor.js`, `src/heartbeat.js` |
| Tests | `test/*.test.js` |

## Pull request checklist

- [ ] `npm test` passes locally
- [ ] New behavior has tests (unit or CLI e2e)
- [ ] README / `docs/SCHEMA.md` updated if user-facing
- [ ] `CHANGELOG.md` entry under `[Unreleased]` or new version
- [ ] Heartbeat and `.agent/README.md` protocol stay consistent across templates

## Release checklist (maintainers)

1. Bump `package.json` version
2. Update `CHANGELOG.md` with date
3. Update README pinned version examples
4. `npm test` && `npm publish` (via GitHub release workflow)
5. Tag release on GitHub

## Dogfood

This repo uses `.agent/backlog/tasks.md` for maintainer work. Consumer projects should run `agentic-crew init` or copy `examples/hello-team/.agentic-crew.yaml`.
