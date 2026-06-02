---
id: 10-tawi50-employee-records
title: TAWI50 Employee Records — Annual Tax Certificate
edition: MDD
depends_on: [01-core-infrastructure, 06-employees]
relates: [09-pnd1-records, 08-wht-transactions]
source_files:
  - src/backend/shared/services/tawi50EmployeeRecords.ts
  - src/backend/main/ipc/tawi50EmployeeRecords.ts
  - src/renderer/pages/tawi50
routes: []
models: [tawi50_employee_records]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [tawi50, annual-tax, employee-tax, thai-tax, json-serialization]
path: Tax/TAWI50
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# TAWI50 Employee Records

## Purpose

Annual tax certificate (Thai TAWI-50 form) data per employee. Stores multiple income items as a JSON array in the database. Totals are auto-calculated on add/update. Supports filtering by employee and tax year.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-tawi50-employee-records` | List with optional `{employeeId?, taxYear?}` filter |
| `get-tawi50-employee-record-by-id` | Single record |
| `add-tawi50-employee-record` | Create; auto-calculates totals |
| `update-tawi50-employee-record` | Update; recalculates totals |
| `delete-tawi50-employee-record` | Hard delete |

## Data Model

**Tawi50EmployeeRecord** — `id`, `employeeId`, `taxYear`, `incomeItems: Tawi50IncomeItem[]` (stored as JSON string), `totalIncome`, `totalTax`, `deliveryMethod`, `issuedDate`, `bookNo`, `runNo`, joined `employeeName`

**Tawi50IncomeItem** — `income`, `taxWithheld`

## Business Rules

- `incomeItems` serialised to JSON string in DB; deserialised on read via `parseRecord` helper
- `totalIncome` and `totalTax` are recalculated from `incomeItems` on every add/update
- `issuedDate`, `bookNo`, `runNo` are nullable
- Hard delete; missing record returns `error.notFound`

## Known Issues
[]
