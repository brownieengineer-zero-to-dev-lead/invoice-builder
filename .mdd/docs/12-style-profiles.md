---
id: 12-style-profiles
title: Style Profiles — PDF Invoice Appearance Presets
edition: MDD
depends_on: [01-core-infrastructure]
relates: [02-invoice-quotation, 15-presets, 17-pdf-export]
source_files:
  - src/backend/shared/services/styleProfiles.ts
  - src/backend/main/ipc/styleProfiles.ts
  - src/renderer/pages/styleProfiles
routes: []
models: [style_profiles]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [style-profile, pdf, layout, font, watermark, json-serialization, batch]
path: App/Style Profiles
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Style Profiles

## Purpose

Reusable PDF appearance presets. Controls layout, colours, fonts, table styles, page format, watermarks, and column visibility. Complex fields (`fieldSortOrders`, `pdfTexts`) are JSON-serialised in the database.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-styleProfiles` | List with optional FilterData; includes usage counts |
| `add-styleProfile` | Create style profile |
| `update-styleProfile` | Update; JSON fields serialised |
| `delete-styleProfile` | Hard delete |
| `batch-add-styleProfile` | Insert multiple in a transaction |

## Data Model

**StyleProfile** — 34 fields including: `name`, `color`, `logoSize`, `fontSize`, `fontFamily`, `layoutType`, `tableHeaderStyle`, `tableRowStyle`, `pageFormat`, `watermark`/`paidWatermark` (base64 + file metadata: size/type/name), `labelUpperCase`, `showQuantity`, `showUnit`, `showRowNo`, `fieldSortOrders` (JSON), `pdfTexts` (JSON), `isArchived`

**EntityWithCounts** — extends StyleProfile with `invoiceCount`, `quotesCount`

## Business Rules

- `fieldSortOrders` and `pdfTexts` are JSON-stringified on insert/update, JSON-parsed on retrieval
- Bidirectional conversion: handles both JSON string and plain object input
- Batch add wrapped in transaction; rollback on failure
- Counts invoices and quotations using this style profile via LEFT JOIN
- Hard delete

## Known Issues
[]
