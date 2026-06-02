---
id: 11-settings
title: Settings — Global Application Configuration
edition: MDD
depends_on: [01-core-infrastructure]
relates: [12-style-profiles]
source_files:
  - src/backend/shared/services/settings.ts
  - src/backend/main/ipc/settings.ts
  - src/renderer/pages/settings
routes: []
models: [settings]
test_files: []
data_flow: reads-existing
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [settings, configuration, single-row]
path: App/Settings
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Settings

## Purpose

Single-row global application configuration. Stores user preferences and app-level options. Read returns the settings row or null if not yet initialised.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-settings` | Returns current settings row or null |
| `update-settings` | Partial or full update; ignores system fields |

## Data Model

**Settings** — dynamic fields (varies by app version); always excludes `createdAt`, `updatedAt`, `id` from updates.

## Business Rules

- Single-row pattern — only one settings record exists
- Update is a noop if no fields are provided
- `updatedAt` is always set on update
- System fields (`createdAt`, `updatedAt`, `id`) are excluded from the update payload

## Known Issues
[]
