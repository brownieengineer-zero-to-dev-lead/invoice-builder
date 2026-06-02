---
id: 15-presets
title: Presets — Invoice Template Bundles
edition: MDD
depends_on: [01-core-infrastructure, 04-businesses, 03-clients, 14-categories-units-currencies, 13-banks, 12-style-profiles]
relates: [02-invoice-quotation]
source_files:
  - src/backend/shared/services/presets.ts
  - src/backend/main/ipc/presets.ts
  - src/renderer/pages/presets
routes: []
models: [presets]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [preset, template, invoice-bundle, enriched-read, json-serialization]
path: Catalog/Presets
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Presets

## Purpose

Bundles of invoice defaults: a specific business, client, currency, bank, and style profile combined into a named preset. On read, performs a 5-table LEFT JOIN to return fully enriched snapshots of all linked entities.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-presets` | List with optional FilterData; fully enriched |
| `add-preset` | Create preset |
| `update-preset` | Update preset; wrapped in transaction |
| `delete-preset` | Hard delete |
| `batch-add-preset` | Insert multiple in a transaction |

## Data Model

**Preset** — `id`, `name`, `businessId`, `clientId`, `currencyId`, `bankId`, `styleProfilesId`, `customerNotes`, `thanksNotes`, `termsConditionNotes`, `language`, `signatureData`/`Size`/`Type`/`Name`, `isArchived`

**Enriched read** includes nested snapshots of: business (name/address/logo/email/phone), client (name/address/email/code), currency (code/symbol/subunit/format), bank (all fields), style profile (all fields including watermarks, with `fieldSortOrders`/`pdfTexts` JSON-parsed).

## Business Rules

- Read performs 5-table LEFT JOIN; any linked entity may be missing (NULL handled)
- `fieldSortOrders` and `pdfTexts` on style profile are JSON-parsed on retrieval
- Add/update wrapped in transaction with rollback on failure
- Hard delete

## Known Issues
[]
