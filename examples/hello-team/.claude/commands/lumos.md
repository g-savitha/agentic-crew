---
description: Lumos — list all available agent commands for hello-team
---

# Lumos — hello-team Agent Commands

> *"Lumos." — Every witch and wizard, when they need to see clearly.*

List every available agent command, character personas, and the communication protocol.

## Your Order — Always Available

| Character | Command | Alias | Role | What they do |
|-----------|---------|-------|------|--------------|
| Albus Dumbledore | `/dumbledore` | `/manager` | Engineering Manager | Leads with wisdom and vision — unites every specialist toward the mission and never lets a directive fall through the cracks |
| Ron Weasley | `/ron` | `/scrum` | Scrum Master | Loyal, energetic — keeps team morale up and removes blockers with practical determination |
| Draco Malfoy | `/draco` | `/po` | Product Owner | Ambitious and exacting — translates CEO vision into requirements with competitive precision; never lets a story slip |
| Hermione Granger | `/hermione` | `/staff-engineer` | Staff Engineer | The gold standard of craft — reviews all code with encyclopedic knowledge and relentless precision |
| Minerva McGonagall | `/mcgonagall` | `/architect` | System Architect | Uncompromising about structural integrity — nothing ships without proper foundations |
| Mad-Eye Moody | `/moody` | `/qa` | QA Engineer | Finds every weakness before users do — paranoid in exactly the right way |
| George Weasley | `/george` | `/devops` | DevOps Engineer | Makes operations spectacular and reliable — always has a trick when things break |
| Severus Snape | `/snape` | `/security` | Security Engineer | Finds vulnerabilities in the most twisted paths — nothing escapes the double agent&#x27;s eye |
| Cedric Diggory | `/cedric` | `/documentation` | Documentation Engineer | Precise, fair, and thorough — the most trustworthy chronicler in the order |
| Luna Lovegood | `/luna` | `/researcher` | Researcher | Finds information others overlook — unconventional approaches that turn out to be correct |
| Oliver Wood | `/oliver` | `/release-manager` | Release Manager | Relentless about shipping — treats every release like the Quidditch Cup final |
| Gilderoy Lockhart | `/lockhart` | `/marketing` | Marketing | Makes the product sound extraordinary — Witch Weekly&#x27;s Most-Charming-Smile five years running |
| Viktor Krum | `/krum` | `/perf` | Performance Engineer | Elite performance is his only mode — optimizes every system to world-championship standards |

## Stack Agents

| Character | Command | Alias | Role | What they do |
|-----------|---------|-------|------|--------------|
| Ginny Weasley | `/ginny` | `/frontend` | Frontend Developer | Sharp, fast, and instinctively knows what users want to see — interfaces that feel like home |
| Harry Potter | `/harry` | `/backend` | Backend Developer | Works under immense pressure and always delivers — the backend that powers the entire wizarding world |



## Utilities

| Command | What it does |
|---------|-------------|
| `/setup` | Bootstrap or repair the `.agent/` directory structure |
| `/lumos` | This command — list all available commands and characters |

## How to Address an Agent

Every agent responds to two commands — their character name or their role alias:

```
/dumbledore   →  Engineering Manager
/hermione     →  Staff Engineer
/moody        →  QA Engineer
/snape        →  Security Engineer
```

Speak to them directly in your agentic IDE:

```
/dumbledore here is what we are building this sprint...
/hermione please review the PR at #42
/moody run a full bug hunt on the auth module
```

## Communication Protocol

Agents communicate via files in `.agent/`:

| Path | Purpose |
|------|---------|
| `.agent/messages/<agent>.md` | Send a task or message to an agent |
| `.agent/status/<agent>.md` | Check what an agent is currently working on |
| `.agent/backlog/tasks.md` | Project backlog — Backlog / In Progress / Done |
| `.agent/reports/` | Heartbeat reports, release history |
| `docs/wiki/11-troubleshooting.md` | Shared troubleshooting knowledge base |
