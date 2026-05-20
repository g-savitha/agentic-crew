# hello-team — minimal consumer example

This folder shows how to configure **agentic-crew** and run a full scaffold.

## Try it

From this directory:

```bash
npx agentic-crew@1.0.2 init --yes --config .agentic-crew.yaml
agentic-crew doctor --dir . --strict
```

Or scaffold from the repo root:

```bash
npx agentic-crew init --yes --config examples/hello-team/.agentic-crew.yaml --output-dir examples/hello-team --force
```

## What you get

- Skill files under `.cursor/commands/` (and other targets if `target: all`)
- `.agent/` shared state (status, messages, backlog, heartbeat, retro)
- Starter runbooks under `docs/runbooks/` (`release.md`, `on-call.md`, `incident.md`)
- `.agentic-crew.json` manifest for `doctor` / `update`

## First workflow (5 minutes)

1. `npx agentic-crew init` (or use the config above)
2. In your IDE: `/team manager Review the backlog and report blockers`
3. Open `.agent/reports/heartbeat.md` — Manager should overwrite the structured snapshot
4. Add a task to `.agent/backlog/tasks.md`, then `/team backend <task>`

See the main [README](../../README.md) for limitations (file-based conventions, no autonomous orchestrator).
