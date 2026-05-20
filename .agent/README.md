# agentic-crew — Agent Team (dogfood)

Shared state for maintaining the **agentic-crew** CLI itself. The human maintainer is the **CEO**; use this backlog for release and v1 work.

## Structure

- `backlog/tasks.md` — Backlog / In Progress / Done
- `reports/heartbeat.md` — Latest manager check-in snapshot (overwrite, not append)

## Invoke (in Cursor)

This repo is the CLI package, not a full scaffolded consumer project. For slash commands, run `npx agentic-crew init` in a target app or see `examples/hello-team/`.

## Protocol

See generated `.agent/README.md` from `init` for the full message format. Heartbeat uses structured YAML frontmatter (`updated`, `blockers`, `decisions_needed`, `accomplishments`).
