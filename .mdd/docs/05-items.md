---
id: 05-items
title: Items — Invoice Line Item Templates
edition: MDD
depends_on: [01-core-infrastructure, 14-categories-units]
relates: [02-invoice-quotation, 15-presets]
source_files:
  - src/backend/shared/services/items.ts
  - src/backend/main/ipc/items.ts
  - src/renderer/pages/items
routes: []
models: [items]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [item, product, line-item, batch, filter, category, unit]
path: Catalog/Items
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Items

## Purpose

Reusable product/service templates for invoice line items. Supports flexible filtering, relation resolution (unit/category names), and usage counting across invoices and quotations. Batch operations are transactional.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-items` | List with optional FilterData; includes usage counts and relation names |
| `add-item` | Create single item |
| `update-item` | Update item fields |
| `delete-item` | Hard delete |
| `batch-add-item` | Insert multiple in a single transaction |

## Data Model

**Item** — `id`, `name`, `amount`, `description`, `unitId`, `categoryId`, `isArchived`

**EntityWithCounts** — extends Item with `invoiceCount`, `quotesCount` (distinct), `unitName`, `categoryName`

## Business Rules

- `handleItemEntity` factory handles add/update logic uniformly
- Counts join through `invoice_items → invoices`, using `DISTINCT` to avoid duplicates
- Batch add wrapped in DB transaction; on failure → rollback; if rollback fails → `error.rollbackFailed`
- Filtering via `getHavingClauseFromFilters` applied after aggregation
- Hard delete (no soft archive)

## Known Issues
[]
