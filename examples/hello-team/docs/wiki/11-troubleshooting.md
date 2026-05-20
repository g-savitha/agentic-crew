# Troubleshooting Guide — hello-team

> **Living document.** Every agent has a standing directive to report solved problems to the Documentation Engineer. Entries are indexed by domain. TS-NNN numbers are permanent.

---

## Table of Contents

- [CI/CD \& Release](#cicd--release)
- [Build \& Toolchain](#build--toolchain)
- [Domain: General software engineering](#domain-General software engineering)
- [Security](#security)
- [Core Services](#core-services)
- [Testing \& QA](#testing--qa)
- [Process \& Workflow](#process--workflow)

---

## CI/CD & Release

*No entries yet. When DevOps or Release Manager solves a CI/CD problem, they report it here.*

---

## Build & Toolchain

*No entries yet. When Backend or Staff Engineer solves a build or toolchain problem, they report it here.*

---

## Domain: General software engineering

*No entries yet. When Domain Expert or Networking solves a domain-specific problem, they report it here.*

---

## Security

*No entries yet. When Security solves a vulnerability or security configuration issue, they report it here.*

---

## Core Services

*No entries yet. When Backend or Architect solves a core service problem (IPC, state management, concurrency), they report it here.*

---

## Testing & QA

*No entries yet. When QA or Backend solves a test environment or flaky test problem, they report it here.*

---

## Process & Workflow

*No entries yet. When any agent solves a process, tooling, or workflow problem, they report it here.*

---

## How to Add an Entry

Write to `.agent/messages/documentation.md`:

```
**Domain**: <section name from Table of Contents>
**Problem**: <one-line title>
**Symptom**: <exact error or observable failure>
**Root Cause**: <why it happened>
**Solution**: <numbered steps with exact commands>
**References**: <PR #, file:line, issue #>
```

Documentation will assign a TS-NNN number, format the entry, and add it here.

**Do not self-edit this file.** All entries go through Documentation for consistent formatting.
