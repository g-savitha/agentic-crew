---
description: Setup — one-time bootstrap skill for hello-team agent team infrastructure
---

# Setup — Bootstrap

> This is a **meta-skill**, not a team member. Run it once when adopting the agent team to create or repair the full `.agent/` directory structure. It has no character persona — it's a tool.

You are the **setup utility** for the **hello-team** agent team. When invoked, you create or repair the complete agent team infrastructure in the current project directory.

## When Invoked

$ARGUMENTS

## Agents in This Project

The following agents must have status and message files (from `.agentic-crew.json`):

- `manager` — Engineering Manager
- `scrum` — Scrum Master
- `po` — Product Owner
- `staff-engineer` — Staff Engineer
- `architect` — System Architect
- `qa` — QA Engineer
- `devops` — DevOps Engineer
- `security` — Security Engineer
- `frontend` — Frontend Developer
- `backend` — Backend Developer

## What You Do

**Step 1 — Verify command directories**:
- `.claude/commands`
- List any missing agent skill files; do not overwrite existing skill content.

**Step 2 — Create `.agent/` structure**:
```bash
mkdir -p .agent/status .agent/messages .agent/backlog .agent/reports
```

**Step 3 — Create status and message files** (only if missing):
```bash
[ -f ".agent/status/manager.md" ] || printf '%s\n' "---" "agent: manager" "status: Idle" "---" > ".agent/status/manager.md"
[ -f ".agent/messages/manager.md" ] || printf '%s\n' "---" "---" > ".agent/messages/manager.md"
[ -f ".agent/status/scrum.md" ] || printf '%s\n' "---" "agent: scrum" "status: Idle" "---" > ".agent/status/scrum.md"
[ -f ".agent/messages/scrum.md" ] || printf '%s\n' "---" "---" > ".agent/messages/scrum.md"
[ -f ".agent/status/po.md" ] || printf '%s\n' "---" "agent: po" "status: Idle" "---" > ".agent/status/po.md"
[ -f ".agent/messages/po.md" ] || printf '%s\n' "---" "---" > ".agent/messages/po.md"
[ -f ".agent/status/staff-engineer.md" ] || printf '%s\n' "---" "agent: staff-engineer" "status: Idle" "---" > ".agent/status/staff-engineer.md"
[ -f ".agent/messages/staff-engineer.md" ] || printf '%s\n' "---" "---" > ".agent/messages/staff-engineer.md"
[ -f ".agent/status/architect.md" ] || printf '%s\n' "---" "agent: architect" "status: Idle" "---" > ".agent/status/architect.md"
[ -f ".agent/messages/architect.md" ] || printf '%s\n' "---" "---" > ".agent/messages/architect.md"
[ -f ".agent/status/qa.md" ] || printf '%s\n' "---" "agent: qa" "status: Idle" "---" > ".agent/status/qa.md"
[ -f ".agent/messages/qa.md" ] || printf '%s\n' "---" "---" > ".agent/messages/qa.md"
[ -f ".agent/status/devops.md" ] || printf '%s\n' "---" "agent: devops" "status: Idle" "---" > ".agent/status/devops.md"
[ -f ".agent/messages/devops.md" ] || printf '%s\n' "---" "---" > ".agent/messages/devops.md"
[ -f ".agent/status/security.md" ] || printf '%s\n' "---" "agent: security" "status: Idle" "---" > ".agent/status/security.md"
[ -f ".agent/messages/security.md" ] || printf '%s\n' "---" "---" > ".agent/messages/security.md"
[ -f ".agent/status/frontend.md" ] || printf '%s\n' "---" "agent: frontend" "status: Idle" "---" > ".agent/status/frontend.md"
[ -f ".agent/messages/frontend.md" ] || printf '%s\n' "---" "---" > ".agent/messages/frontend.md"
[ -f ".agent/status/backend.md" ] || printf '%s\n' "---" "agent: backend" "status: Idle" "---" > ".agent/status/backend.md"
[ -f ".agent/messages/backend.md" ] || printf '%s\n' "---" "---" > ".agent/messages/backend.md"
```

**Step 4 — Create backlog, heartbeat, and retro** (if not present):
```bash
[ -f ".agent/backlog/tasks.md" ] || echo "(see scaffolded tasks.md)" > .agent/backlog/tasks.md
[ -f ".agent/reports/heartbeat.md" ] || printf '%s\n' "---" "updated: never" "blockers: []" "decisions_needed: []" "accomplishments: []" "---" "# Team heartbeat" > .agent/reports/heartbeat.md
[ -f ".agent/reports/retro.md" ] || printf '%s\n' "# Sprint retrospective" "" "Append dated sections after each sprint (Scrum owns this file)." > .agent/reports/retro.md
```

**Step 5 — Create `docs/` structure**:
```bash
mkdir -p docs/wiki docs/adr docs/runbooks
```

**Step 6 — Report what was created**:
List every file and directory created. Confirm the structure is complete.

**Step 7 — Write a welcome message to Manager** (append to `.agent/messages/manager.md`):
```
## Agent team bootstrapped (from Setup, <date>)

The .agent/ infrastructure has been created or repaired. All status and message files are initialized.

Next step: CEO should brief the team via /manager.
```

## What NOT to Do

- Do not overwrite existing status or message files (they may contain important state)
- Do not modify command skill files in `.claude/commands` (skill definitions are the source of truth)
- Do not create content in `docs/` beyond the directory structure (Documentation owns that)
