---
id: 08-wht-transactions
title: WHT Transactions — Withholding Tax Payment Records
edition: MDD
depends_on: [01-core-infrastructure, 07-contractors, 04-businesses]
relates: [09-pnd1-records, 10-tawi50-employee-records]
source_files:
  - src/backend/shared/services/whtTransactions.ts
  - src/backend/main/ipc/whtTransactions.ts
  - src/renderer/pages/whtTransactions
  - src/renderer/pages/taxReport
routes: []
models: [wht_transactions]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [wht, withholding-tax, pnd, contractor, tax-report, thai-tax]
path: Tax/WHT Transactions
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# WHT Transactions

## Purpose

Records of withholding tax deducted from contractor payments. Supports multi-field filtering (contractor, PND type, month, year) and aggregated tax report summaries grouped by `pndType`/`year`/`month`.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-wht-transactions` | List with optional filter `{contractorId?, pndType?, month?, year?}` |
| `get-wht-transaction-by-id` | Single record |
| `add-wht-transaction` | Create record |
| `update-wht-transaction` | Update record |
| `delete-wht-transaction` | Hard delete |
| `get-wht-tax-report-summary` | Aggregated summary `{businessId, month?, year?, pndType?}` |

## Data Model

**WhtTransaction** — `id`, `businessId`, `contractorId`, `invoiceId`, `payDate`, `pndType`, `incomeType`, `incomeTypeOther`, `whtRate`, `amountBeforeTax`, `taxWithheld`, `deliveryMethod`, `issuedDate`, `bookNo`, `runNo`

Reads join `contractorName` and `businessName` from related tables.

## Business Rules

- Hard delete (no soft archive)
- Date filtering uses `strftime` to extract month/year from `payDate`
- Tax report summary groups by `pndType`, `year`, `month`; returns totals per group
- JOIN on contractor and business is LEFT JOIN (either may be unlinked)

## Known Issues
[]
