# agentic-crew

> Scaffold a full AI engineering team into any project — personas, wired and ready in 60 seconds.

```bash
# Pin the version — do not use bare `npx agentic-crew` in production (supply-chain risk)
npx agentic-crew@1.0.2 init
```

---

## What Is This?

`agentic-crew` gives you a complete AI-powered engineering team that lives inside your project. Each agent is a skill file you invoke by name — `/dumbledore`, `/hermione`, `/manager`, etc. They communicate asynchronously through flat files, coordinate via a shared backlog, and report to you.

You bring the ideas. You invoke the team — each agent runs when you call it in your IDE.

---

## Quick Start

```bash
# Interactive (recommended) — pin version in scripts/CI
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
npx agentic-crew@1.0.1 update

# Preview update changes
npx agentic-crew update --dry-run

# Replace user-edited skill files with latest templates
npx agentic-crew@1.0.1 update --force-overwrite

# Remove scaffold artifacts (keep .agent/ state)
npx agentic-crew uninstall --keep-state
```

---

## Commands

| Command | Description |
|---------|-------------|
| `agentic-crew init` | Scaffold the team (interactive or `--yes` with flags) |
| `agentic-crew doctor` | Validate `.agent/`, manifest, and skill files |
| `agentic-crew doctor --fix` | Repair missing scaffold files (`--prune` to remove stale roster files) |
| `agentic-crew update` | Re-render skill templates (preserves user edits unless `--force-overwrite`) |
| `agentic-crew update --dry-run` | Preview template refresh and stale file removal |
| `agentic-crew uninstall` | Remove generated skill files and manifest |

All commands support `--json` for scripting/CI.

### Programmatic API

Use this when you want to run agentic-crew **from your own Node.js code** — CI generators, monorepo tooling, custom CLIs — without shelling out to the bin:

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

The CLI (`agentic-crew init`) is a thin wrapper around these functions. Import `agentic-crew/cli` only if you need the Commander program itself.

Manifest JSON Schema: `require('agentic-crew/schema/manifest.schema.json')`

### Config file (`.agentic-crew.yaml`)

Check in a config file so teammates and CI get the same roster without memorizing flags:

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
theme: professional
withSecurityCi: true
```

Init auto-discovers `.agentic-crew.yaml` or `.agentic-crew.config.json` in the output directory. CLI flags override config values. Non-interactive init requires `--yes` plus `--name` (or `yes: true` and `name` in config). A config file with only `name:` does **not** skip the questionnaire.

**YAML limitations**: the built-in parser supports **flat keys and simple lists only** (no nested objects). Use JSON config if you need richer structure.

### `init` options

| Flag | Description |
|------|-------------|
| `--name` | Project name (required with `--yes`) |
| `--description` | One-line description |
| `--repo` | GitHub URL |
| `--frontend` | Stack key or custom text |
| `--backend` | Stack key or custom text |
| `--domain` | Comma-separated domains (`ml`, `data`, `networking`, …) |
| `--domain-other` | Additional custom domain label |
| `--optional` | Comma-separated optional roles: `sre`, `tpm` |
| `--preset` | `startup` (default), `full`, `minimal`, or `enterprise` |
| `--theme` | `phoenix` (default) or `professional` |
| `--target` | `claude`, `cursor`, `codex`, `windsurf`, `both` (default), or `all` |
| `--config` | Path to YAML/JSON config (auto-discovers `.agentic-crew.yaml`) |
| `--save-config` | Write `.agentic-crew.yaml` after scaffold |
| `--output-dir` | Directory to scaffold into (default `.`) |
| `--dry-run` | Show planned output without writing |
| `--force` | Allow init when `.agent/` already exists |
| `--force-overwrite` | Replace user-edited command skill files |
| `--custom-role` | `Name|Description` — repeatable custom role |
| `--with-security-ci` | Add `.github/workflows/security.yml` to the target project |
| `--with-gitignore` | Append agentic-crew recommendations to `.gitignore` (or `withGitignore: true` in config) |
| `--yes` | Skip questionnaire (requires `--name`) |
| `--json` | Machine-readable JSON output |

### `update` options

| Flag | Description |
|------|-------------|
| `--dir` | Project directory (default `.`) |
| `--force` | Overwrite generated docs/backlog |
| `--force-overwrite` | Replace user-edited command skill files |
| `--backup` | Copy prior command files to `.agentic-crew.bak/` before updating |
| `--dry-run` | Preview changes without writing |
| `--json` | Machine-readable JSON output |

### `doctor` options

| Flag | Description |
|------|-------------|
| `--dir` | Project directory (default `.`) |
| `--fix` | Repair missing scaffold files |
| `--prune` | With `--fix`, remove files no longer in the manifest roster |
| `--strict` | Treat heartbeat, message, runbook, and security-CI warnings as errors |
| `--json` | Machine-readable JSON output |

### `uninstall` options

| Flag | Description |
|------|-------------|
| `--dir` | Project directory (default `.`) |
| `--keep-state` | Preserve `.agent/` (status, messages, backlog) |
| `--dry-run` | Show what would be removed |
| `--json` | Machine-readable JSON output |

---

## The Team

### Always included (13 agents)

| Character | Command | Alias | Role |
|-----------|---------|-------|------|
| Albus Dumbledore | `/dumbledore` | `/manager` | Engineering Manager |
| Ron Weasley | `/ron` | `/scrum` | Scrum Master |
| Draco Malfoy | `/draco` | `/po` | Product Owner |
| Hermione Granger | `/hermione` | `/staff-engineer` | Staff Engineer |
| Minerva McGonagall | `/mcgonagall` | `/architect` | System Architect |
| Mad-Eye Moody | `/moody` | `/qa` | QA Engineer |
| George Weasley | `/george` | `/devops` | DevOps Engineer |
| Severus Snape | `/snape` | `/security` | Security Engineer |
| Cedric Diggory | `/cedric` | `/documentation` | Documentation Engineer |
| Luna Lovegood | `/luna` | `/researcher` | Researcher |
| Oliver Wood | `/oliver` | `/release-manager` | Release Manager |
| Gilderoy Lockhart | `/lockhart` | `/marketing` | Marketing |
| Viktor Krum | `/krum` | `/perf` | Performance Engineer |

### Optional (select at init)

| Role | Character | Command | Alias |
|------|-----------|---------|-------|
| Site Reliability Engineer | Dobby | `/dobby` | `/sre` |
| Technical Program Manager | Percy Weasley | `/tpm` | — |

### Added based on your stack (select multiple domains)

| Selection | Character | Command | Role |
|-----------|-----------|---------|------|
| Any frontend | Ginny Weasley | `/ginny` | Frontend Developer |
| Any backend | Harry Potter | `/harry` | Backend Developer |
| ML / AI | Nicolas Flamel | `/flamel` | ML / AI Engineer |
| Databases | Arthur Weasley | `/arthur` | Database Engineer |
| Mobile | Neville Longbottom | `/neville` | Mobile Developer |
| Game dev | Seamus Finnigan | `/seamus` | Game Developer |
| Embedded / Systems | Charlie Weasley | `/charlie` | Systems Engineer |
| Blockchain | Sirius Black | `/sirius` | Blockchain Developer |
| Networking | Nymphadora Tonks | `/tonks` | Networking Expert |
| Custom domain | Filius Flitwick | `/flitwick` | Domain Expert |

With `--theme professional`, only role-based commands (e.g. `/manager`) are generated — no character aliases. The catalog is `/help` instead of `/lumos`.

With `--theme phoenix` (default), character commands (e.g. `/dumbledore`) are **alias stubs** pointing at canonical role files (e.g. `manager.md`). The catalog is `/lumos`.

---

## What Gets Created

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

---

## How It Works

Agents communicate by reading and writing files in `.agent/`. No live connections — just files. Every agent can be invoked independently and picks up where the last session left off.

Use `/team <agent> <task>` to route to any specialist. Use `/lumos` (phoenix) or `/help` (professional) to list every command. Use `agentic-crew doctor` to verify the install.

### Limitations (read before v1 expectations)

- **No orchestrator** — agents do not run automatically; you (the CEO) invoke slash commands in your IDE.
- **`/team` is a convention** — the router skill tells the model to read another agent's skill file; it does not spawn separate agent processes.
- **Protocol is voluntary** — models may skip reading `.agent/` unless you enforce it in your workflow; use `doctor --strict` to catch heartbeat, message, runbook, and security-CI drift.
- **File conflicts** — concurrent edits to the same `.agent/` file are not merged; coordinate via append-only messages.

### 5-minute walkthrough

1. `npx agentic-crew@1.0.2 init --yes --name my-app --frontend react --backend nodejs --preset startup`
2. `agentic-crew doctor --strict`
3. In Cursor: `/team manager Review backlog and update heartbeat`
4. Confirm `.agent/reports/heartbeat.md` has structured frontmatter (`blockers`, `decisions_needed`, …)
5. Add a task to `.agent/backlog/tasks.md`, then `/team backend Implement the top backlog item`

See `examples/hello-team/` for a copy-paste config.

---

## vs CrewAI and LangGraph

| | **agentic-crew** | **CrewAI / LangGraph** |
|---|---|---|
| What it is | Repo scaffold + IDE slash-command skills + file protocol | Python runtimes with programmatic agent graphs |
| Execution | You invoke agents in the IDE; no background orchestrator | Code drives multi-step flows and handoffs |
| State | `.agent/` flat files (git-friendly, human-readable) | In-memory / DB / framework state |
| Best for | Teams that want a persistent “engineering org” in the repo | Apps that need automated multi-agent pipelines |

agentic-crew does **not** replace CrewAI or LangGraph for autonomous workflows — it gives you a **team-in-a-box** that works with any agentic IDE.

**Themes:** `phoenix` and `professional` are built in. Custom npm theme packs are not supported yet.

---

## Philosophy

- **File-based async** — reliable, inspectable, version-controllable
- **You set direction** — agents execute; the CEO (you) decides product direction
- **Persistent state** — status, messages, and backlog survive between sessions
- **Single source of truth** — `.agentic-crew.json` records your roster for doctor/update
- **IDE-flexible** — Claude Code, Cursor, Codex, and Windsurf out of the box (`--target all`)
- **Role-specific expertise** — each agent skill includes a tailored senior brief (not generic boilerplate)

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
