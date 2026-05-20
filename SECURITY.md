# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | Yes                |
| 0.8.x   | Yes                |
| 0.7.x   | Best effort        |
| 0.6.x   | Best effort        |
| < 0.6   | No                 |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email or DM the maintainer with:

- A description of the issue
- Steps to reproduce
- Impact assessment (what an attacker could do)
- Affected versions

We aim to acknowledge reports within **3 business days** and provide a fix or mitigation timeline within **14 days** for confirmed issues.

## Supply chain

When installing this CLI:

- **Pin the version**: `npx agentic-crew@<version> init` (not bare `npx agentic-crew`)
- Prefer adding as a **devDependency** with a lockfile: `npm install -D agentic-crew@<version>`
- Review generated files under `.cursor/commands/`, `.claude/commands/`, and `.agent/` before committing

Published packages use [npm provenance](https://docs.npmjs.com/generating-provenance-statements) when available.

## Scope

In scope:

- This repository and published npm package
- Path traversal or unsafe writes via CLI flags
- Template injection via user-provided project metadata
- Malicious or unintended content in generated agent skill files

Out of scope:

- Security of third-party IDEs (Cursor, Claude Code)
- Vulnerabilities in user application code scaffolded alongside the team
