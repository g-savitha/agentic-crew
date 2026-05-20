# Manifest schema v1

The file `.agentic-crew.json` is the contract between your project and the `agentic-crew` CLI. **Schema version 1 is stable** for the 1.0.x release line.

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
| `theme` | `phoenix` (character names + aliases) or `professional` (role-based commands only) |
| `preset` | `startup` (default for new installs), `full`, `minimal`, or `enterprise` |
| `targets` | `both`, `all`, or individual IDE keys |
| `supplementaryFiles` | e.g. `AGENTS.md`, `.cursor/rules/agentic-crew.mdc` |
| `customRoles` | User-defined agents |
| `withSecurityCi` | Whether security workflow was scaffolded |

## Migrations

On `agentic-crew update`, structural migrations run automatically:

- Missing `schemaVersion` → set to `1`
- Missing `commandHashes` → `{}`
- Missing `preset` → `full` (legacy manifests only; new installs default to `startup`)
- Missing `supplementaryFiles` → `[]`

Agent roster is **not** changed by migrations. To change team composition, re-run `init --force` or edit the manifest deliberately.

## Themes

Built-in themes only:

| Theme | Catalog | Start command | Style |
|-------|---------|---------------|-------|
| `phoenix` | `/lumos` | `/dumbledore` | Harry Potter personas + role aliases |
| `professional` | `/help` | `/manager` | Role-based commands only |

Custom npm theme packs (`@agentic-crew/theme-*`) are planned for a future release.

## JSON Schema

Machine-readable schema: `agentic-crew/schema/manifest.schema.json`
