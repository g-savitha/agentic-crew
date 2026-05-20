# Manifest schema v1

The file `.agentic-crew.json` is the contract between your project and the `agentic-crew` CLI. **Schema version 1 is stable** for the 0.7.x release line.

## Required fields

| Field | Type | Description |
|-------|------|-------------|
| `schemaVersion` | `1` | Manifest schema (bump only on breaking CLI changes) |
| `packageVersion` | string | `agentic-crew` version that last wrote the manifest |
| `agents` | array | Roster of agent skill files |
| `project.name` | string | Project name |
| `commandDirs` | string[] | Relative paths to IDE command directories |
| `commandHashes` | object | Content hashes for safe update preservation |

## Common optional fields

| Field | Description |
|-------|-------------|
| `theme` | `phoenix` or `professional` (or external theme id) |
| `preset` | `full`, `minimal`, `enterprise`, `startup` |
| `targets` | `both`, `all`, or individual IDE keys |
| `supplementaryFiles` | e.g. `AGENTS.md`, `.cursor/rules/agentic-crew.mdc` |
| `customRoles` | User-defined agents |
| `withSecurityCi` | Whether security workflow was scaffolded |

## Migrations

On `agentic-crew update`, structural migrations run automatically:

- Missing `schemaVersion` → set to `1`
- Missing `commandHashes` → `{}`
- Missing `preset` → `full`
- Missing `supplementaryFiles` → `[]`

Agent roster is **not** changed by migrations. To change team composition, re-run `init --force` or edit the manifest deliberately.

## External theme packs (0.7+)

Install a theme package:

```bash
npm install -D @agentic-crew/theme-yourtheme
agentic-crew init --theme yourtheme
```

Theme packages export:

```js
module.exports = {
  id: 'yourtheme',
  catalogCommand: 'help',
  startCommand: 'manager',
  applyThemePack(agent) { /* ... */ },
  agentOverrides: {
    manager: { character: '...', command: '...' },
  },
};
```

## JSON Schema

Machine-readable schema: `agentic-crew/schema/manifest.schema.json`
