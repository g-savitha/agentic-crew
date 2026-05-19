# agentic-crew

> Scaffold a full AI engineering team into any project — personas, wired and ready in 60 seconds.

```bash
# Pin the version — do not use bare `npx agentic-crew` in production (supply-chain risk)
npx agentic-crew@latest init
```

---

## What Is This?

`agentic-crew` gives you a complete AI-powered engineering team that lives inside your project. Each agent is a skill file you invoke by name — `/dumbledore`, `/hermione`, `/manager`, etc. They communicate asynchronously through flat files, coordinate via a shared backlog, and report to you.

You bring the ideas. The team executes.

---

## Quick Start

```bash
# Interactive (recommended) — pin version in scripts/CI
npx agentic-crew@0.2.1 init

# Non-interactive
npx agentic-crew@0.2.1 init --yes \
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

# Refresh command templates (preserves user-edited skill files)
npx agentic-crew@0.2.1 update

# Replace user-edited skill files with latest templates
npx agentic-crew@0.2.1 update --force-overwrite
```

---

## Commands

| Command | Description |
|---------|-------------|
| `agentic-crew init` | Scaffold the team (interactive or `--yes` with flags) |
| `agentic-crew doctor` | Validate `.agent/`, manifest, and skill files |
| `agentic-crew update` | Re-render skill templates (preserves user edits unless `--force-overwrite`) |

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
| `--theme` | `phoenix` (default) or `professional` |
| `--target` | `claude`, `cursor`, or `both` (default) |
| `--output-dir` | Directory to scaffold into (default `.`) |
| `--dry-run` | Show planned output without writing |
| `--force` | Allow init when `.agent/` already exists |
| `--force-overwrite` | Replace user-edited command skill files |
| `--custom-role` | `Name|Description` — repeatable custom role |
| `--with-security-ci` | Add `.github/workflows/security.yml` to the target project |
| `--yes` | Skip questionnaire (requires `--name`) |

### `update` options

| Flag | Description |
|------|-------------|
| `--dir` | Project directory (default `.`) |
| `--force` | Overwrite generated docs/backlog |
| `--force-overwrite` | Replace user-edited command skill files |
| `--backup` | Copy prior command files to `.agentic-crew.bak/` |

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

With `--theme professional`, only role-based commands (e.g. `/manager`) are generated — no character aliases. The command catalog is `/help` instead of `/lumos`.

---

## What Gets Created

```
your-project/
  .agentic-crew.json      ← manifest (version, agents, stacks, file hashes)
  .github/workflows/      ← optional security.yml (--with-security-ci)
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

Use `/lumos` (Phoenix theme) or `/help` (professional theme) to list every command. Use `agentic-crew doctor` to verify the install.

---

## Philosophy

- **File-based async** — reliable, inspectable, version-controllable
- **You set direction** — agents execute; the CEO (you) decides product direction
- **Persistent state** — status, messages, and backlog survive between sessions
- **Single source of truth** — `.agentic-crew.json` records your roster for doctor/update
- **IDE-flexible** — Claude Code and Cursor out of the box
- **Role-specific expertise** — each agent skill includes a tailored senior brief (not generic boilerplate)

---

## Requirements

- Node.js ≥ 18
- An agentic IDE that supports slash-command skill files (Claude Code, Cursor, etc.)

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
