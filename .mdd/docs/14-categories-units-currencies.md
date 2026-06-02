---
id: 14-categories-units-currencies
title: Categories, Units & Currencies — Reference Data
edition: MDD
depends_on: [01-core-infrastructure]
relates: [05-items, 02-invoice-quotation]
source_files:
  - src/backend/shared/services/categories.ts
  - src/backend/shared/services/units.ts
  - src/backend/shared/services/currencies.ts
  - src/backend/main/ipc/categories.ts
  - src/backend/main/ipc/units.ts
  - src/backend/main/ipc/currencies.ts
  - src/renderer/pages/categories
  - src/renderer/pages/units
  - src/renderer/pages/currencies
routes: []
models: [categories, units, currencies]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [category, unit, currency, reference-data, crud, batch]
path: Catalog/Reference Data
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Categories, Units & Currencies

## Purpose

Simple reference data used by items and invoices. All three follow the same CRUD + batch + usage-count pattern.

## IPC Channels

All three share the same channel shape (replace `<entity>` with `category`, `unit`, or `currency`):

| Channel | Description |
|---------|-------------|
| `get-all-<entity>` | List with optional FilterData; includes usage counts |
| `add-<entity>` | Create |
| `update-<entity>` | Update |
| `delete-<entity>` | Hard delete |
| `batch-add-<entity>` | Insert multiple in a transaction |

## Data Models

**Category** — `id`, `name`, `isArchived`

**Unit** — `id`, `name`, `isArchived`

**Currency** — `id`, `code`, `symbol`, `text`, `format`, `subunit`, `isArchived`

All return `EntityWithCounts` with `invoiceCount` and `quotesCount`.

## Business Rules

- **Categories & Units:** usage counted via triple-join: `categories/units → items → invoice_items → invoices`
- **Currencies:** usage counted via direct JOIN on `invoices.currencyId`
- Batch add is transactional; stops and rolls back on first failure
- All use hard delete
- Seeded on DB creation: a set of default currencies, units, and categories

## Known Issues
[]
