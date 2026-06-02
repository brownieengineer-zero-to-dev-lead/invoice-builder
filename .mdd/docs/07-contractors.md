---
id: 07-contractors
title: Contractors — WHT Vendor Entity Management
edition: MDD
depends_on: [01-core-infrastructure]
relates: [08-wht-transactions]
source_files:
  - src/backend/shared/services/contractors.ts
  - src/backend/main/ipc/contractors.ts
  - src/renderer/pages/contractors
routes: []
models: [contractors]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [contractor, vendor, wht, archive, crud]
path: Contacts/Contractors
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Contractors

## Purpose

Manage contractor records (external vendors/freelancers) that receive payments subject to withholding tax. Linked to WHT transactions. Similar pattern to employees but without `baseSalary`.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-contractors` | List; optional `showArchived` param |
| `get-contractor-by-id` | Single record lookup |
| `add-contractor` | Create contractor |
| `update-contractor` | Update contractor fields |
| `delete-contractor` | Soft delete via `isArchived = true` |

## Data Model

**Contractor** — `id`, `type` (contractor category), `name`, `taxId`, Thai decomposed address fields, `isArchived`, `createdAt`, `updatedAt`

## Business Rules

- Soft delete via `isArchived` — retained for WHT history
- `type` field categorises contractor (e.g. freelancer, company)
- No duplicate validation at service level
- Missing contractor returns `error.notFound`

## Known Issues
[]
