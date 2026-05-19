# agentic-crew

> Scaffold a full AI engineering team into any project — Harry Potter personas, wired and ready in 60 seconds.

```bash
npx agentic-crew init
```

---

## What Is This?

`agentic-crew` gives you a complete AI-powered engineering team that lives inside your project. Each agent is a skill file you invoke by name — `/dumbledore`, `/hermione`, `/moody`, etc. They communicate asynchronously through flat files, coordinate via a shared backlog, and report to you.

You bring the ideas. The Order executes.

---

## The Order of the Phoenix

### Always included

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
| Voldemort | `/voldemort` | `/tpm` | Technical Program Manager |

### Added based on your stack

| Selection | Character | Command | Role |
|-----------|-----------|---------|------|
| Any frontend | Ginny Weasley | `/ginny` | Frontend Developer |
| Any backend | Harry Potter | `/harry` | Backend Developer |
| ML / AI domain | Nicolas Flamel | `/flamel` | ML / AI Engineer |
| Databases domain | Arthur Weasley | `/arthur` | Database Engineer |
| Mobile domain | Neville Longbottom | `/neville` | Mobile Developer |
| Game dev domain | J.K. Rowling | `/rowling` | Game Developer |
| Embedded / Systems | Charlie Weasley | `/charlie` | Systems Engineer |
| Blockchain / Web3 | Sirius Black | `/sirius` | Blockchain Developer |
| Networking | Nymphadora Tonks | `/tonks` | Networking Expert |

Every agent has two commands — their character name and their role alias. Both work identically.

---

## Quick Start

```bash
# Install globally
npm install -g agentic-crew

# Or run directly
npx agentic-crew init
```

Answer a few questions:

- Project name and description
- Frontend stack (React, Next.js, Vue, Svelte, Angular, or none)
- Backend stack (Go, Python, Node.js, Rust, Java, Ruby, .NET, or none)
- Specialized domain (ML/AI, Databases, Mobile, Game Dev, Embedded, Blockchain, Networking)
- Any custom roles you want to add

Then run `/lumos` in your IDE to see every available command.

---

## What Gets Created

```
your-project/
  .claude/
    commands/           ← agent skill files (one per role + character-name aliases)
  .agent/
    status/             ← each agent's current state
    messages/           ← each agent's inbox
    backlog/
      tasks.md          ← task list (Backlog / In Progress / Done)
    reports/            ← generated reports and release history
  docs/
    wiki/
      11-troubleshooting.md   ← living troubleshooting guide
    adr/
      template.md             ← Architecture Decision Record template
    runbooks/
```

---

## How It Works

```mermaid
graph TD
    You([You]) -->|directive| MGR[/dumbledore\nEngineering Manager]
    MGR -->|broadcast| PO[/draco\nProduct Owner]
    MGR -->|broadcast| SCR[/ron\nScrum Master]
    MGR -->|broadcast| BE[/harry\nBackend Developer]
    MGR -->|broadcast| ARC[/mcgonagall\nArchitect]
    MGR -->|broadcast| QA[/moody\nQA Engineer]
    MGR -->|broadcast| DEV[/george\nDevOps]
    MGR -->|broadcast| SEC[/snape\nSecurity]
    MGR -->|broadcast| DOC[/cedric\nDocumentation]
    BE -->|PR| SE[/hermione\nStaff Engineer]
    SE -->|review| BE
    QA -->|bug report| BE
    BE & QA & DEV & SEC -->|solved problems| DOC
    DOC -->|entries| wiki[(docs/wiki)]
```

Agents communicate by reading and writing files in `.agent/`. No live connections, no shared memory — just files. Every agent can be invoked independently, in any order, and picks up exactly where the last one left off.

---

## Addressing Agents

Speak to them by name or by role — both work:

```
/dumbledore check team status and unblock anyone who's stuck
/hermione please review the PR at #42
/moody run a full bug hunt on the auth module
/snape security review the new API endpoints
/oliver cut v1.0.0
```

Run `/lumos` anytime to see all available commands for your project.

---

## Custom Roles

During `agentic-crew init`, you can add custom roles beyond the defaults. Each custom role gets:

- A skill file in `.claude/commands/`
- A randomly assigned Harry Potter character persona
- A character-named command alias
- Status and message files in `.agent/`

---

## Philosophy

- **File-based async** — agents communicate through files, not shared state. Reliable, inspectable, version-controllable.
- **You set direction** — agents execute. No agent makes product decisions without you.
- **Persistent state** — status files and backlog survive between sessions.
- **Troubleshooting as knowledge** — every solved problem gets documented. The team gets smarter over time.
- **Works with any agentic IDE** — Claude Code, Cursor, Codex, or anything that supports slash-command skill files.

---

## Requirements

- Node.js ≥ 18
- Any agentic IDE that supports slash-command skill files

---

## License

MIT © Savitha Gollamudi
