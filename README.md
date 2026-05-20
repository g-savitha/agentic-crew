# agentic-crew

> Scaffold a full AI engineering team into your repo — roles, slash commands, and shared state — in about a minute.

```bash
# Pin the version in scripts and CI (avoid bare `npx agentic-crew` in production)
npx agentic-crew@1.0.2 init
```

---

## Overview

Most agentic workflows are either a single general-purpose assistant or a Python framework you wire up yourself. **agentic-crew** is different: it drops a structured engineering org into your project as files you own.

You get Engineering Manager, Staff Engineer, QA, DevOps, Security, stack-specific developers, and more. Each role is an IDE skill file (Cursor, Claude Code, Codex, Windsurf). You invoke them like teammates:

```text
/team manager Review the backlog and unblock QA
/team backend Implement AUTH-12 from the backlog
/lumos                    # list the roster (phoenix theme)
```

Nothing runs in the background. **You** call the agents. They coordinate through **`.agent/`** — status, inboxes, backlog, heartbeat — so work persists between sessions and shows up in git.

In short: **org chart + handoff protocol + IDE commands**, checked into the repo. Not a hosted multi-agent runtime.

---

## Who it's for

- You already use an agentic IDE and want **persistent roles** instead of re-explaining "act as staff engineer" every session.
- You want a **shared backlog and handoff format** humans and AI assistants can read.
- You want output you can **review in git** — markdown and JSON, not opaque agent state.

If you need **fully autonomous** agents chaining tasks without you in the loop, use CrewAI or LangGraph instead (see [comparison](#how-this-differs) below).

---

## Quick start

Run from your repo root. Interactive mode walks you through stack and roster size; `--yes` is for scripts and CI.

```bash
# Interactive (recommended)
npx agentic-crew@1.0.2 init

# Config-driven init (place .agentic-crew.yaml in project root)
npx agentic-crew init --save-config   # writes example config after scaffold

# All IDE targets + /team router
npx agentic-crew@1.0.2 init --yes \
  --name "my-app" \
  --target all \
  --preset startup

# Non-interactive — enterprise preset (lean roster, no marketing)
npx agentic-crew@1.0.2 init --yes \
  --name "my-app" \
  --description "A real-time collaboration tool" \
  --frontend nextjs \
  --backend go \
  --domain ml,data \
  --target both \
  --preset enterprise

# Preview without writing files
npx agentic-crew init --dry-run --yes --name demo --frontend react --backend nodejs

# Validate an existing install
npx agentic-crew doctor

# Repair missing scaffold files
npx agentic-crew doctor --fix

# Refresh command templates (preserves user-edited skill files and docs)
npx agentic-crew@1.0.2 update

# Preview update changes
npx agentic-crew update --dry-run

# Replace user-edited skill files with latest templates
npx agentic-crew@1.0.2 update --force-overwrite

# Remove scaffold artifacts (keep .agent/ state)
npx agentic-crew uninstall --keep-state
```

After init, open your IDE and run **`/team`** or your manager command (`/manager` or `/dumbledore` with the phoenix theme). Use **`/lumos`** or **`/help`** to see every command on your roster.

---

## CLI reference

| Command                         | Description                                                                 |
| ------------------------------- | --------------------------------------------------------------------------- |
| `agentic-crew init`             | Scaffold the team (interactive or `--yes` with flags)                       |
| `agentic-crew doctor`           | Validate `.agent/`, manifest, and skill files                               |
| `agentic-crew doctor --fix`     | Repair missing scaffold files (`--prune` to remove stale roster files)      |
| `agentic-crew update`           | Re-render skill templates (preserves user edits unless `--force-overwrite`) |
| `agentic-crew update --dry-run` | Preview template refresh and stale file removal                             |
| `agentic-crew uninstall`        | Remove generated skill files and manifest                                   |

All commands support `--json` for scripting and CI.

### Programmatic API

Use the package from Node when you want CI generators, monorepo tooling, or a custom CLI without shelling out:

```js
const {
  scaffold,       // write skill files + .agent/ from answers object
  runDoctor,      // validate install; returns { ok, issues, warnings }
  runUpdate,      // refresh templates from installed package version
  runUninstall,   // remove scaffold artifacts
  loadProjectConfig, // read .agentic-crew.yaml / .json
  resolveAllAgents,  // compute roster from stack/preset answers
} = require('agentic-crew');

await scaffold({
  projectName: 'my-app',
  frontend: 'react',
  backend: 'go',
  domains: ['ml'],
  theme: 'professional',
  targets: 'all',
  outputDir: './apps/web',
}, { force: true });
```

The `agentic-crew init` CLI is a thin wrapper around these functions. Import `agentic-crew/cli` only if you need the Commander program itself.

Manifest JSON Schema: `require('agentic-crew/schema/manifest.schema.json')`

### Config file (`.agentic-crew.yaml`)

Check in a config file so teammates and CI use the same roster without memorizing flags:

```yaml
name: my-app
description: A real-time collaboration tool
frontend: nextjs
backend: go
domains:
  - ml
  - data
target: all
preset: startup
theme: phoenix
withSecurityCi: true
```

Init auto-discovers `.agentic-crew.yaml` or `.agentic-crew.config.json` in the output directory. CLI flags override config values. Non-interactive init requires `--yes` plus `--name` (or `yes: true` and `name` in config). A config file with only `name:` does **not** skip the questionnaire.

**YAML limitations**: the built-in parser supports **flat keys and simple lists only** (no nested objects). Use JSON config if you need richer structure.

### `init` options

| Flag                 | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `--name`             | Project name (required with `--yes`)                                                        |
| `--description`      | One-line description                                                                        |
| `--repo`             | GitHub URL                                                                                  |
| `--frontend`         | Stack key or custom text                                                                    |
| `--backend`          | Stack key or custom text                                                                    |
| `--domain`           | Comma-separated domains (`ml`, `data`, `networking`, …)                                     |
| `--domain-other`     | Additional custom domain label                                                              |
| `--optional`         | Comma-separated optional roles: `sre`, `tpm`                                                |
| `--preset`           | `startup` (default), `full`, `minimal`, or `enterprise` — **roster only** (see table below) |
| `--theme`            | `phoenix` (default) or `professional` — independent of preset; CLI/config wins              |
| `--target`           | `claude`, `cursor`, `codex`, `windsurf`, `both` (default), or `all`                         |
| `--config`           | Path to YAML/JSON config (auto-discovers `.agentic-crew.yaml`)                              |
| `--save-config`      | Write `.agentic-crew.yaml` after scaffold                                                   |
| `--output-dir`       | Directory to scaffold into (default `.`)                                                    |
| `--dry-run`          | Show planned output without writing                                                         |
| `--force`            | Allow init when `.agent/` already exists                                                    |
| `--force-overwrite`  | Replace user-edited command skill files                                                     |
| `--custom-role`      | `Name \| Description` — repeatable custom role                                                |
| `--with-security-ci` | Add `.github/workflows/security.yml` to the target project                                  |
| `--with-gitignore`   | Append agentic-crew recommendations to `.gitignore` (or `withGitignore: true` in config)    |
| `--yes`              | Skip questionnaire (requires `--name`)                                                      |
| `--json`             | Machine-readable JSON output                                                                |

**Preset rosters** (core agents; stack and optional roles still apply):

| Preset              | Omits from core roster                                      |
| ------------------- | ----------------------------------------------------------- |
| `startup` (default) | documentation, marketing, researcher, release-manager, perf |
| `minimal`           | marketing, researcher, release-manager, perf                  |
| `enterprise`        | marketing                                                     |
| `full`              | —                                                           |

Use `--preset full` if you want the Documentation agent (`/documentation` or `/cedric`).

### `update` options

| Flag                | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `--dir`             | Project directory (default `.`)                                  |
| `--force`           | Overwrite generated docs/backlog                                 |
| `--force-overwrite` | Replace user-edited command skill files                          |
| `--backup`          | Copy prior command files to `.agentic-crew.bak/` before updating |
| `--dry-run`         | Preview changes without writing                                  |
| `--json`            | Machine-readable JSON output                                     |

### `doctor` options

| Flag       | Description                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `--dir`    | Project directory (default `.`)                                                                       |
| `--fix`    | Repair missing scaffold files                                                                         |
| `--prune`  | With `--fix`, remove files no longer in the manifest roster                                           |
| `--strict` | Errors on status frontmatter, catalog/roster drift, heartbeat, messages, retro, runbooks, security CI |
| `--json`   | Machine-readable JSON output                                                                          |

### `uninstall` options

| Flag           | Description                                    |
| -------------- | ---------------------------------------------- |
| `--dir`        | Project directory (default `.`)                |
| `--keep-state` | Preserve `.agent/` (status, messages, backlog) |
| `--dry-run`    | Show what would be removed                     |
| `--json`       | Machine-readable JSON output                   |

---

## The team

Two knobs: **`--preset`** (core roster size) and **`--theme`** (Harry Potter personas vs plain role names). Default is `startup` + `phoenix` — lean roster with character aliases.

### Full core roster (`--preset full` — 13 agents)

These roles are included when nothing is excluded. **`startup`** (default) omits documentation, marketing, researcher, release-manager, and perf. Use `full` or `minimal` if you want Documentation on the team.

| Character          | Command       | Alias              | Role                   |
| ------------------ | ------------- | ------------------ | ---------------------- |
| Albus Dumbledore   | `/dumbledore` | `/manager`         | Engineering Manager    |
| Ron Weasley        | `/ron`        | `/scrum`           | Scrum Master           |
| Draco Malfoy       | `/draco`      | `/po`              | Product Owner          |
| Hermione Granger   | `/hermione`   | `/staff-engineer`  | Staff Engineer         |
| Minerva McGonagall | `/mcgonagall` | `/architect`       | System Architect       |
| Mad-Eye Moody      | `/moody`      | `/qa`              | QA Engineer            |
| George Weasley     | `/george`     | `/devops`          | DevOps Engineer        |
| Severus Snape      | `/snape`      | `/security`        | Security Engineer      |
| Cedric Diggory     | `/cedric`     | `/documentation`   | Documentation Engineer |
| Luna Lovegood      | `/luna`       | `/researcher`      | Researcher             |
| Oliver Wood        | `/oliver`     | `/release-manager` | Release Manager        |
| Gilderoy Lockhart  | `/lockhart`   | `/marketing`       | Marketing              |
| Viktor Krum        | `/krum`       | `/perf`            | Performance Engineer   |

### Optional (select at init)

| Role                      | Character     | Command  | Alias  |
| ------------------------- | ------------- | -------- | ------ |
| Site Reliability Engineer | Dobby         | `/dobby` | `/sre` |
| Technical Program Manager | Percy Weasley | `/tpm`   | —      |

### Added based on your stack

| Selection          | Character          | Command     | Role                 |
| ------------------ | ------------------ | ----------- | -------------------- |
| Any frontend       | Ginny Weasley      | `/ginny`    | Frontend Developer   |
| Any backend        | Harry Potter       | `/harry`    | Backend Developer    |
| ML / AI            | Nicolas Flamel     | `/flamel`   | ML / AI Engineer     |
| Databases          | Arthur Weasley     | `/arthur`   | Database Engineer    |
| Mobile             | Neville Longbottom | `/neville`  | Mobile Developer     |
| Game dev           | Seamus Finnigan    | `/seamus`   | Game Developer       |
| Embedded / Systems | Charlie Weasley    | `/charlie`  | Systems Engineer     |
| Blockchain         | Sirius Black       | `/sirius`   | Blockchain Developer |
| Networking         | Nymphadora Tonks   | `/tonks`    | Networking Expert    |
| Custom domain      | Filius Flitwick    | `/flitwick` | Domain Expert        |

With **`--theme professional`**, only role-based commands (e.g. `/manager`) are generated — no character aliases. The catalog is `/help`.

With **`--theme phoenix`** (default), character commands (e.g. `/dumbledore`) are alias stubs pointing at canonical role files (e.g. `manager.md`). The catalog is `/lumos`.

---

## What gets created

```
your-project/
  .agentic-crew.json      ← manifest (schemaVersion, agents, stacks, file hashes)
  .agentic-crew.yaml      ← optional config (--save-config)
  .github/workflows/      ← optional security.yml (--with-security-ci)
  AGENTS.md               ← team map for Codex / --target all
  .claude/commands/       ← Claude Code skill files
  .cursor/commands/       ← Cursor skill files
  .cursor/rules/          ← agentic-crew.mdc rule (when Cursor selected)
  .codex/skills/          ← Codex skills (--target codex or all)
  .windsurf/workflows/    ← Windsurf workflows (--target windsurf or all)
  .agent/
    status/               ← each agent's current state
    messages/             ← each agent's inbox (append-only)
    backlog/tasks.md      ← Backlog / In Progress / Done
    reports/heartbeat.md  ← manager check-in summary
    reports/retro.md      ← scrum retrospective (starter)
  docs/
    wiki/11-troubleshooting.md
    adr/template.md
    runbooks/             ← release.md, on-call.md, incident.md (starters)
```

Init creates the full tree. The in-IDE **`/setup`** command exists only to repair missing `.agent/` files if something was deleted — you do not need it after a normal install.

---

## How it works

```text
You  →  /team qa Run regression on the auth module
          ↓
       qa.md skill (instructions for the QA agent)
          ↓
       Reads .agent/backlog/, .agent/messages/qa.md, writes .agent/status/qa.md
```

No message bus, websocket, or scheduler. **Files are the API.**

| Path                          | What it's for                                                  |
| ----------------------------- | -------------------------------------------------------------- |
| `.agent/status/<agent>.md`    | What that agent is doing right now                             |
| `.agent/messages/<agent>.md`  | Inbox (append-only handoffs)                                   |
| `.agent/backlog/tasks.md`     | Backlog / In Progress / Done                                   |
| `.agent/reports/heartbeat.md` | Manager's team snapshot (overwrite on check-in)                |
| `.agentic-crew.json`          | Roster + hashes so `doctor` / `update` know what you installed |

**`/team`** is the router: `/team <agent> <task>` tells the model which skill file to follow. **`/lumos`** or **`/help`** lists the agents on *your* roster (respects preset exclusions).

Run **`agentic-crew doctor --strict`** in CI to catch drift — bad heartbeat frontmatter, catalog listing agents you did not scaffold, missing runbooks, and similar issues.

### Limitations

- **No orchestrator** — agents do not run automatically; you invoke slash commands in your IDE.
- **`/team` is a convention** — the router skill tells the model to read another agent's skill file; it does not spawn separate processes.
- **Protocol is voluntary** — models may skip `.agent/` unless your workflow enforces it; use `doctor --strict` to catch drift.
- **File conflicts** — concurrent edits to the same `.agent/` file are not merged; coordinate via append-only messages.

### Try it in five minutes

1. `npx agentic-crew@1.0.2 init --yes --name my-app --frontend react --backend nodejs --preset startup`
2. `agentic-crew doctor --strict` — should pass with no issues
3. In your IDE: `/team manager Review backlog and update heartbeat`
4. Open `.agent/reports/heartbeat.md` — Manager should overwrite it with `blockers`, `decisions_needed`, etc.
5. Add a line to `.agent/backlog/tasks.md`, then `/team backend Implement the top backlog item`

A working example lives in [`examples/hello-team/`](examples/hello-team/).

---

## How this differs

**agentic-crew** does not replace CrewAI or LangGraph for autonomous multi-step workflows. It gives you a **team-in-a-box** that works with any agentic IDE: explicit roles, file-based coordination, and skills you can diff in git.

**Themes:** `phoenix` (character names + `/lumos`) and `professional` (role commands only + `/help`). Preset and theme are independent — `startup` + `phoenix` is the default.

---

## Design choices

- **Files over frameworks** — git diffs, code review, no vendor runtime lock-in
- **You stay in charge** — agents advise and execute when called; product decisions stay with you
- **Roster is explicit** — `.agentic-crew.json` + `doctor` so the repo reflects who is actually on the team
- **Real role briefs** — each skill ships with senior-level scope (threat modeling for security, not generic "be helpful")
- **IDE-portable** — same protocol across Cursor, Claude Code, Codex, and Windsurf

---

## Requirements

- Node.js ≥ 18
- An agentic IDE that supports slash-command skill files (Claude Code, Cursor, Codex, Windsurf, etc.)

---

## Security

- **Pin installs**: use `npx agentic-crew@<version>` or add as a devDependency with a lockfile
- **Review output**: inspect generated `.cursor/commands/` / `.claude/commands/` before committing
- **`doctor`**: validates manifest version, aliases, and required paths
- **`update`**: preserves locally edited skill files unless you pass `--force-overwrite`
- See [SECURITY.md](SECURITY.md) for vulnerability reporting

---

## License

MIT © Savitha Gollamudi
