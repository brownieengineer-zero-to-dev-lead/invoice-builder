---
id: 16-import-export
title: Import / Export — Full Database Backup & Restore
edition: MDD
depends_on: [01-core-infrastructure]
relates: [02-invoice-quotation]
source_files:
  - src/backend/shared/services/importExport.ts
  - src/backend/main/ipc/importExport.ts
routes: []
models: []
test_files: []
data_flow: mixed
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [import, export, backup, restore, json, sqlite, postgresql, migration]
path: App/Import Export
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Import / Export

## Purpose

Full-database backup (export to JSON) and restore (import from JSON). Covers all 21 tables. Handles binary fields (logos, attachments, QR codes, watermarks) by encoding to/from base64. Supports both SQLite and PostgreSQL dialects.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `export-all-data` | Shows save dialog; writes JSON file with ISO date in filename |
| `import-all-data` | Shows open dialog for JSON; parses and restores all tables |

## Covered Tables (21)

presets, invoiceSequences, banks, styleProfiles, settings, businesses, clients, items, units, categories, currencies, invoices, invoiceBankSnapshots, invoiceBusinessSnapshots, invoiceClientSnapshots, invoiceCurrencySnapshots, invoiceStyleProfileSnapshots, invoiceItemSnapshots, invoiceCustomizations, invoiceItems, invoicePayments, attachments

## Business Rules

- **Export:** encodes binary fields (`encode`) → serialises to JSON → user chooses save path
- **Import:** user picks JSON file → parses → `decode` restores binary fields → inserts all tables
- Import deletes tables in dependency order before inserting (presets first, banks last) to respect foreign keys
- SQLite: disables foreign keys during import, re-enables after
- PostgreSQL: resets sequences via `setval` after import
- All import operations wrapped in a single transaction; rollback on any error
- Boolean fields converted to int for SQLite compatibility
- Missing `invoiceFullNumber` field handled gracefully (backward compat)
- Dialog cancellation returns `{success: false}` without error

## Known Issues
[]
