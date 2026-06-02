---
id: 01-core-infrastructure
title: Core Infrastructure — Electron App, Database, Migrations
edition: MDD
depends_on: []
relates: [02-invoice-quotation, 11-settings]
source_files:
  - src/backend/main/main.ts
  - src/backend/main/database.ts
  - src/backend/main/config.ts
  - src/backend/shared/db/setup.ts
  - src/backend/shared/db/migrationRunner.ts
  - src/backend/shared/db/client.ts
routes: []
models:
  - invoices
  - invoice_items
  - invoice_payments
  - attachments
  - clients
  - businesses
  - settings
  - currencies
  - units
  - categories
  - banks
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [electron, sqlite, postgresql, migrations, database, infrastructure]
path: Core/Infrastructure
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Core Infrastructure

## Purpose

Electron app entry point, database adapter initialization, schema setup, and migration runner. Supports both SQLite (local file) and PostgreSQL (Docker/server) backends. This is the foundation all other features depend on.

## Architecture

```
main.ts
  └─ loads BrowserWindow (dev: http://127.0.0.1:5173 | prod: bundled HTML)
  └─ registers IPC handlers (via ipc/index)
  └─ context isolation: ON, nodeIntegration: OFF

database.ts  (singleton DatabaseAdapter)
  └─ db/setup.ts    → CREATE TABLE, seed currencies/units/categories, indexes
  └─ db/migrationRunner.ts → discovers and applies .ts/.cjs migration files
  └─ db/client.ts   → adapter wrapping sqlite3 or pg
```

## Database Backends

| Backend | Config | Trigger |
|---------|--------|---------|
| SQLite | `SqLiteConfig` | default, local file |
| PostgreSQL | `PostgresConfig` | Docker compose / server setup |

`database.ts` closes any existing adapter before opening a new one. Throws `error.noDatabase` if neither config is supplied.

## Schema

11 tables created in `setup.ts`, with foreign key constraints and 17 performance indexes. Initial seed data: currencies, units, categories.

Database name validation: alphanumeric + underscore, max 63 chars.

## Migration Runner

- Discovers migration files matching `YYYYMMDD-NN-*.{ts,cjs,js}` — sorted alphabetically
- Tracks applied migrations in a `migrations` table
- Wraps all migrations in a transaction; rolls back on any failure
- Disables SQLite foreign keys during migration, re-enables after
- Throws `error.noUpFunction` if a migration file has no `.up()` export

## Config

`config.ts` exports `APP_CONFIG`:
- `DB_NAME` — default database filename
- `FE_SERVER_URL` — `http://127.0.0.1:5173` (Vite dev server)

## Business Rules

- Dev mode: loads renderer from Vite dev server URL
- Prod mode: loads from bundled `index.html`
- macOS: app does not quit when last window is closed (platform convention)
- `createIfMissing: true` → deletes existing SQLite DB before recreating; initialises schema + seed
- Schema setup wrapped in transaction; rollback on failure

## Known Issues
[]
