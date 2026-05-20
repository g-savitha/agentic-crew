# @agentic-crew/theme-sample

Reference theme pack for [agentic-crew](https://github.com/g-savitha/agentic-crew). Use it to validate external theme loading or as a template for your own package (`@agentic-crew/theme-<yourname>`).

## Install

```bash
npm install -D agentic-crew@1.0.0 @agentic-crew/theme-sample@1.0.0
```

## Use

```bash
npx agentic-crew init --yes --name my-app --theme sample --frontend react --backend nodejs --preset startup
```

## Package contract

Export a CommonJS module with:

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Theme id (matches `--theme` flag) |
| `catalogCommand` | yes | Catalog skill filename without `.md` (e.g. `help`) |
| `startCommand` | yes | Default agent slug for `/team` with no args |
| `useCharacterAliases` | yes | `false` for role-only commands |
| `applyThemePack(agent)` | yes | Returns themed agent definition |
| `agentOverrides` | no | Per-`file` overrides (manager, qa, …) |

Publish your own pack to npm as `@agentic-crew/theme-<name>` or `agentic-crew-theme-<name>`.
