---
id: 03-clients
title: Clients — CRUD and Invoice Count Aggregation
edition: MDD
depends_on: [01-core-infrastructure]
relates: [02-invoice-quotation, 04-businesses]
source_files:
  - src/backend/shared/services/clients.ts
  - src/backend/main/ipc/clients.ts
  - src/renderer/pages/clients
routes: []
models: [clients]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [client, crud, invoice-count, batch]
path: Contacts/Clients
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Clients

## Purpose

Manage client records (individuals or companies that receive invoices). Read operations include a LEFT JOIN to count invoices and quotations linked to each client.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-clients` | List with optional FilterData |
| `add-client` | Create single client |
| `update-client` | Update client fields |
| `delete-client` | Hard delete |
| `batch-add-client` | Insert multiple clients in a transaction |

## Data Model

**Client** — `id`, `name`, `code`, `email`, `phone`, `address` (decomposed Thai-format fields), `taxId`, `isArchived`, `createdAt`, `updatedAt`

**EntityWithCounts** (returned on reads) — extends Client with `invoiceCount`, `quotesCount` (from LEFT JOIN on invoices, counted distinct to avoid duplicates).

## Business Rules

- Hard delete — no soft archive (unlike employees/contractors)
- Batch add wraps all inserts in a single transaction; rolls back entire batch on first failure
- Read query uses `DISTINCT` counts to avoid inflated numbers from joins

## Known Issues
[]
