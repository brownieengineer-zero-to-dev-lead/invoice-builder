---
id: 04-businesses
title: Businesses — Sender Entity Management
edition: MDD
depends_on: [01-core-infrastructure]
relates: [02-invoice-quotation, 03-clients, 13-banks]
source_files:
  - src/backend/shared/services/businesses.ts
  - src/backend/main/ipc/businesses.ts
  - src/renderer/pages/businesses
routes: []
models: [businesses]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [business, company, peppol, vat, address, crud, batch]
path: Contacts/Businesses
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Businesses

## Purpose

Manage the sender side of invoices — businesses or individuals that issue invoices. Supports Thai decomposed address format, VAT numbers, PEPPOL identifiers, and country codes for international e-invoicing.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-businesses` | List with optional FilterData |
| `add-business` | Create single business |
| `update-business` | Update business fields |
| `delete-business` | Hard delete |
| `batch-add-business` | Insert multiple in a transaction |

## Data Model

**Business** — `id`, `name`, `shortName`, `email`, `phone`, `logo` (base64), `taxId`, `vatCode`, `peppolId`, `countryCode`, `isArchived`, plus Thai decomposed address fields: `building`, `roomFloor`, `village`, `no`, `moo`, `soi`, `road`, `subDistrict`, `district`, `province`, `postalCode`

**EntityWithCounts** — extends Business with `invoiceCount`, `quotesCount` via LEFT JOIN.

## Business Rules

- `name` and `shortName` are required
- `paymentInformation` field is deprecated; bank details live in the `banks` table
- Batch add wraps in transaction; entire batch rolls back on first error
- Filtering via optional `FilterData[]`

## Known Issues
[]
