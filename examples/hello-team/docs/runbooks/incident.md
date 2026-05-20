# Incident response runbook — hello-team

> **Owner**: SRE. Use for SEV1/SEV2 customer-impacting events.

## Roles

| Role | Agent |
|------|-------|
| Incident commander | Manager (`/manager`) |
| Technical lead | Staff Engineer or Backend |
| Comms | Documentation / Marketing (if user-facing) |
| Scribe | Scrum (timeline in `.agent/reports/`) |

## Timeline

### 1. Detect & declare (0–15 min)

- [ ] Confirm impact scope (who, what, since when)
- [ ] Declare severity; notify CEO via Manager
- [ ] **Overwrite** `.agent/reports/heartbeat.md` blockers with incident status

### 2. Mitigate (15–60 min)

- [ ] Identify blast radius; stop bleeding (rollback, feature flag, scale)
- [ ] Assign owners in agent message files
- [ ] Post internal updates every 30 min until stable

### 3. Resolve

- [ ] Verify recovery with metrics and smoke tests
- [ ] Document root cause hypothesis
- [ ] Move follow-up work to `.agent/backlog/tasks.md`

### 4. Post-incident (within 48h)

- [ ] Blameless postmortem in `docs/wiki/11-troubleshooting.md` or ADR
- [ ] Update runbooks if a gap was found
- [ ] Clear incident blockers from heartbeat

## Message template

```markdown
---
from: manager
to: <agent>
date: <ISO-8601>
subject: Incident — <short title>
---

Severity: SEV1|SEV2
Impact:
Action needed:
Deadline:
```
