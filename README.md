# agentic-crew

> Scaffold a full AI engineering team into any Claude Code project — 18 specialized agents, Demon Slayer personas, wired and ready in 60 seconds.

```bash
npx agentic-crew init
```

---

## What Is This?

`agentic-crew` gives you a complete AI-powered engineering team that lives inside your Claude Code project. Each agent is a specialized Claude Code skill — you invoke them with `/manager`, `/backend`, `/qa`, etc. They communicate asynchronously through files, coordinate via a shared backlog, and report to you as the **CEO**.

You bring the ideas. The corps executes.

---

## The Corps

| Character | Role | Skill |
|-----------|------|-------|
| Tanjiro Kamado | Engineering Manager | `/manager` |
| Rengoku Kyojuro | Scrum Master | `/scrum` |
| Kiriya Ubuyashiki | Product Owner | `/po` |
| Giyu Tomioka | Staff Engineer | `/staff-engineer` |
| Zenitsu Agatsuma | Backend Developer | `/backend` |
| Gyomei Himejima | System Architect | `/architect` |
| Shinobu Kocho | QA Engineer | `/qa` |
| Tengen Uzui | DevOps Engineer | `/devops` |
| Obanai Iguro | Security Engineer | `/security` |
| Muichiro Tokito | Domain Expert | `/networking` |
| Yoriichi Tsugikuni | Documentation Engineer | `/documentation` |
| Kanao Tsuyuri | Researcher | `/researcher` |
| Inosuke Hashibira | Release Manager | `/release-manager` |
| Mitsuri Kanroji | Marketing | `/marketing` |
| Sanemi Shinazugawa | Performance Engineer | `/perf` |
| Nezuko Kamado | Site Reliability Engineer | `/sre` |
| Kagaya Ubuyashiki | Technical Program Manager | `/tpm` |

Plus a `/setup` bootstrap meta-skill and support for custom roles.

---

## Quick Start

```bash
# Install globally
npm install -g agentic-crew

# Or run directly with npx
npx agentic-crew init
```

The CLI will ask you:
- Project name and description
- Frontend stack (React, Next.js, Vue, Svelte, Angular, or custom)
- Backend stack (Go, Python, Node.js, Rust, Java, Ruby, .NET, or custom)
- Specialized technical domain (Networking, ML/AI, Databases, Mobile, etc.)
- Any custom roles you want to add

Then it scaffolds everything into your project.

---

## What Gets Created

```
your-project/
  .claude/
    commands/           ← 18+ agent skill files, personalized to your stack
  .agent/
    status/             ← each agent's current state
    messages/           ← each agent's inbox (async communication)
    backlog/
      tasks.md          ← product task list (Backlog / In Progress / Done)
    reports/            ← generated reports (heartbeat, release history, etc.)
  docs/
    wiki/
      11-troubleshooting.md   ← living troubleshooting guide
    adr/
      template.md             ← Architecture Decision Record template
    runbooks/                 ← operational runbooks
```

---

## How It Works

```mermaid
graph TD
    CEO([You — CEO]) -->|directive| MGR[/manager\nTanjiro]
    MGR -->|broadcast| PO[/po\nKiriya]
    MGR -->|broadcast| SCR[/scrum\nRengoku]
    MGR -->|broadcast| BE[/backend\nZenitsu]
    MGR -->|broadcast| ARC[/architect\nGyomei]
    MGR -->|broadcast| QA[/qa\nShinobu]
    MGR -->|broadcast| DEV[/devops\nTengen]
    MGR -->|broadcast| SEC[/security\nObanai]
    MGR -->|broadcast| DOC[/documentation\nYoriichi]
    BE -->|PR| SE[/staff-engineer\nGiyu]
    SE -->|review| BE
    QA -->|bug report| BE
    DOC -->|troubleshooting\nentries| wiki[(docs/wiki)]
    BE & QA & DEV & SEC -->|solved problems| DOC
```

Each agent communicates by reading and writing files in `.agent/`. No live connections, no shared memory — just files. This means every agent can be invoked independently, in any order, and picks up exactly where the last one left off.

---

## Invoking Agents

Open your project in Claude Code, then:

```
/manager check team status and unblock anyone who's stuck
/backend implement the user authentication flow from the backlog
/qa run a full bug hunt on the auth module
/architect draft an ADR for the session token storage approach
/documentation write the auth system wiki page
/release-manager cut v1.0.0
```

The CEO (`you`) sets direction. The Manager orchestrates. Everyone else executes.

---

## Custom Roles

During `agentic-crew init`, you can add custom roles. Each custom role gets:
- A scaffolded skill file (`.claude/commands/<role>.md`)
- A Demon Slayer character persona (suggested from reserve characters)
- Status and message files in `.agent/`

---

## Customizing the Domain Expert

The `/networking` agent is a **domain expert template**. By default it covers your project's technical domain. If you want to rename it:

1. Rename `.claude/commands/networking.md` to `.claude/commands/databases.md` (or whatever fits)
2. Update the skill descriptions inside
3. The skill is now `/databases`

---

## Philosophy

- **File-based async** — agents communicate through files, not shared state. Reliable, inspectable, version-controllable.
- **CEO-owned** — you define success. Agents execute. No agent makes product decisions.
- **Persistent state** — status files and backlog survive between Claude Code sessions.
- **Troubleshooting as knowledge** — every solved problem gets documented. The team gets smarter over time.
- **Definition of done** — a feature isn't done until tests pass, docs are updated, and a troubleshooting entry is filed if a tricky problem was solved.

---

## Requirements

- [Claude Code](https://claude.ai/code) (Claude Code CLI, desktop, or IDE extension)
- Node.js ≥ 18

---

## License

MIT © Savitha Gollamudi
