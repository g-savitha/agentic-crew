# agentic-crew

> Scaffold a full AI engineering team into any project — personas, wired and ready in 60 seconds.

```bash
npx agentic-crew init
```

---

## What Is This?

`agentic-crew` gives you a complete AI-powered engineering team that lives inside your project. Each agent is a skill file you invoke by name — `/dumbledore`, `/hermione`, `/manager`, etc. They communicate asynchronously through flat files, coordinate via a shared backlog, and report to you.

You bring the ideas. The team executes.

---

## Quick Start

```bash
# Interactive (recommended)
npx agentic-crew init

# Non-interactive
npx agentic-crew init --yes \
  --name "my-app" \
  --description "A real-time collaboration tool" \
  --frontend nextjs \
  --backend go \
  --domain ml,data \
  --target both \
  --theme phoenix

# Preview without writing files
npx agentic-crew init --dry-run --yes --name demo --frontend react --backend nodejs

# Validate an existing install
npx agentic-crew doctor

# Refresh command templates after upgrading the package
npx agentic-crew update
```

---

## Commands

| Command | Description |
|---------|-------------|
| `agentic-crew init` | Scaffold the team (interactive or `--yes` with flags) |
| `agentic-crew doctor` | Validate `.agent/`, manifest, and skill files |
| `agentic-crew update` | Re-render skill templates from the installed package |

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
| `--theme` | `phoenix` (default) or `professional` |
| `--target` | `claude`, `cursor`, or `both` (default) |
| `--output-dir` | Directory to scaffold into (default `.`) |
| `--dry-run` | Show planned output without writing |
| `--force` | Allow init when `.agent/` already exists |
| `--yes` | Skip questionnaire (requires `--name`) |

---

## The Team

### Always included (15 agents)

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
| Dobby | `/dobby` | `/sre` | Site Reliability Engineer |
| Percy Weasley | `/tpm` | — | Technical Program Manager |

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

With `--theme professional`, only role-based commands (e.g. `/manager`) are generated — no character aliases.

---

## What Gets Created

```
your-project/
  .agentic-crew.json      ← manifest (version, agents, stacks)
  .claude/commands/       ← Claude Code skill files
  .cursor/commands/       ← Cursor skill files (when --target both)
  .agent/
    status/               ← each agent's current state
    messages/             ← each agent's inbox (append-only)
    backlog/tasks.md      ← Backlog / In Progress / Done
    reports/heartbeat.md  ← manager check-in summary
  docs/
    wiki/11-troubleshooting.md
    adr/template.md
    runbooks/
```

Character commands (e.g. `/dumbledore`) are **alias stubs** that point to the canonical role file (e.g. `manager.md`) so updates stay in one place.

---

## How It Works

Agents communicate by reading and writing files in `.agent/`. No live connections — just files. Every agent can be invoked independently and picks up where the last session left off.

Use `/lumos` to list every command for your project. Use `agentic-crew doctor` to verify the install.

---

## Philosophy

- **File-based async** — reliable, inspectable, version-controllable
- **You set direction** — agents execute; the CEO (you) decides product direction
- **Persistent state** — status, messages, and backlog survive between sessions
- **Single source of truth** — `.agentic-crew.json` records your roster for doctor/update
- **IDE-flexible** — Claude Code and Cursor out of the box

---

## Requirements

- Node.js ≥ 18
- An agentic IDE that supports slash-command skill files (Claude Code, Cursor, etc.)

---

## License

MIT © Savitha Gollamudi
