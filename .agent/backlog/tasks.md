# agentic-crew — Task Backlog

> **Protocol**: Move tasks left to right: Backlog → In Progress → Done.

---

## Backlog

*(Empty — v1 hardening tracked below in Done.)*

---

## In Progress

*(None)*

---

## Done

### P0 — Protocol & docs

- [x] Unify heartbeat protocol (overwrite snapshot; other reports may append)
- [x] Scaffold starter runbooks: release, on-call, incident
- [x] Update SECURITY.md supported versions
- [x] README: limitations, YAML config constraints, quickstart walkthrough
- [x] Dogfood `.agent/` on this repo + `examples/hello-team/`

### P1 — Tooling & quality

- [x] Doctor: heartbeat validation + `--strict`
- [x] Doctor `--fix` without prune by default; `--prune` opt-in
- [x] Default preset `startup` (questionnaire + CLI)
- [x] CONTRIBUTING.md
- [x] docs/SCHEMA.md: built-in themes (phoenix / professional) only in 1.0.x
- [x] Tests: runbooks, security-ci, config init e2e, doctor strict
