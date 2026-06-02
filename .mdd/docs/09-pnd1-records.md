---
id: 09-pnd1-records
title: PND1 Records — Monthly Employee Tax Filing
edition: MDD
depends_on: [01-core-infrastructure, 06-employees, 04-businesses]
relates: [08-wht-transactions, 10-tawi50-employee-records]
source_files:
  - src/backend/shared/services/pnd1Records.ts
  - src/backend/main/ipc/pnd1Records.ts
  - src/renderer/pages/pnd1
  - src/renderer/pages/pnd1Monthly
routes: []
models: [pnd1_records]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [pnd1, employee-tax, monthly-tax, thai-tax, withholding-tax, summary]
path: Tax/PND1
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# PND1 Records

## Purpose

Tracks monthly income tax withheld per employee (Thai PND1 form data). Enforces uniqueness per employee/month/year. Provides monthly summary aggregation with totals per business for PDF/report generation.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-pnd1-records` | List with optional filter |
| `get-pnd1-record-by-id` | Single record |
| `add-pnd1-record` | Create; enforces uniqueness on `(employeeId, month, year)` |
| `update-pnd1-record` | Update record |
| `delete-pnd1-record` | Hard delete |
| `get-pnd1-monthly-summary` | Aggregated monthly summary `{month, year, businessId}` |

## Data Model

**Pnd1Record** — `id`, `employeeId`, `month`, `year`, `income`, `taxWithheld`, joined `employeeName`

**Pnd1MonthlySummary** — `month`, `year`, `businessId`, `rows[]` (Pnd1MonthlySummaryRow), `totalIncome`, `totalTax`

**Pnd1MonthlySummaryRow** — `id`, `employeeId`, `employeeName`, `taxId`, `income`, `taxWithheld`

## Business Rules

- Duplicate `(employeeId, month, year)` returns `error.duplicateRecord`
- Monthly summary: joins employee names and taxIds, totals computed via reduce
- Hard delete
- Missing record returns `error.notFound`

## Known Issues
[]
