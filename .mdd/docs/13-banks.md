---
id: 13-banks
title: Banks — Payment Account Details
edition: MDD
depends_on: [01-core-infrastructure]
relates: [02-invoice-quotation, 15-presets]
source_files:
  - src/backend/shared/services/banks.ts
  - src/backend/main/ipc/banks.ts
  - src/renderer/pages/banks
routes: []
models: [banks]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [bank, payment, qr-code, swift, batch]
path: Catalog/Banks
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Banks

## Purpose

Bank/payment account records used on invoices. Supports QR code storage (base64 + file metadata). Replaced the deprecated `paymentInformation` field on the `businesses` table.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-banks` | List with optional FilterData; includes usage counts |
| `add-bank` | Create bank |
| `update-bank` | Update bank |
| `delete-bank` | Hard delete |
| `batch-add-bank` | Insert multiple in a transaction |

## Data Model

**Bank** — `id`, `name`, `bankName`, `accountNumber`, `accountHolder`, `swiftCode`, `address`, `branchCode`, `type`, `routingNumber`, `sortOrder`, `upiCode`, `qrCode` (base64), `qrCodeFileSize`, `qrCodeFileType`, `qrCodeFileName`, `isArchived`

**EntityWithCounts** — extends Bank with `invoiceCount`, `quotesCount`

## Business Rules

- Batch add wrapped in transaction; stops on first failure and rolls back
- `error.rollbackFailed` thrown if rollback itself errors
- Hard delete
- Counts via LEFT JOIN on invoices by `bankId`

## Known Issues
[]
