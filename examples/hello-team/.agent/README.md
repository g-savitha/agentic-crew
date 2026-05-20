# hello-team — Agent Team

This directory is the **shared state hub** for the `hello-team` AI agent team. Agents communicate asynchronously by reading and writing files here. No shared memory, no live connections — just files.

## Structure

```
.agent/
  status/      ← each agent's current state (what they're working on, blockers)
  messages/    ← each agent's inbox (other agents write here; the agent reads on invocation)
  backlog/     ← product task list (tasks.md: Backlog / In Progress / Done)
  reports/     ← generated reports (heartbeat, perf baselines, release history, etc.)
```

## Message Protocol

**To send a message to an agent**: append to `.agent/messages/<agent>.md` (never delete history).

```markdown
---
from: <sender-agent-file>
to: <recipient-agent-file>
date: <ISO-8601>
subject: <short title>
---

<message body>
```

**To update your status**: overwrite `.agent/status/<agent>.md` with your current state.

**To update the backlog**: edit `.agent/backlog/tasks.md` — move tasks between Backlog → In Progress → Done.

## Agents

| Agent | Skill | Character |
|-------|-------|-----------|
| Engineering Manager | /manager | Albus Dumbledore |
| Scrum Master | /scrum | Ron Weasley |
| Product Owner | /po | Draco Malfoy |
| Staff Engineer | /staff-engineer | Hermione Granger |
| System Architect | /architect | Minerva McGonagall |
| QA Engineer | /qa | Mad-Eye Moody |
| DevOps Engineer | /devops | George Weasley |
| Security Engineer | /security | Severus Snape |
| Frontend Developer | /frontend | Ginny Weasley |
| Backend Developer | /backend | Harry Potter |

## CEO Role

The human running this project is the **CEO**. They set direction and vision. All agents execute in service of the CEO's goals. The Manager (`/manager`) is the CEO's primary interface to the team.

## Rules

- Never delete message history — append only
- Status files are overwritten on each invocation (they reflect current state, not history)
- **`heartbeat.md`** is overwritten on each manager check-in (current team snapshot)
- Other files under `reports/` may use append-only dated sections (e.g. `retro.md`, perf baselines)
- Backlog is the single source of truth for work items
- Team roster and scaffold metadata live in `.agentic-crew.json` at the project root
