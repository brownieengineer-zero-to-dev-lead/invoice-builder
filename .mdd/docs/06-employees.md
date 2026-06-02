---
id: 06-employees
title: Employees — WHT Payroll Entity Management
edition: MDD
depends_on: [01-core-infrastructure, 04-businesses]
relates: [09-pnd1-records, 10-tawi50-employee-records]
source_files:
  - src/backend/shared/services/employees.ts
  - src/backend/main/ipc/employees.ts
  - src/renderer/pages/employees
routes: []
models: [employees]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [employee, payroll, wht, archive, crud]
path: Contacts/Employees
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Employees

## Purpose

Manage employee records linked to a business. Used as subjects of PND1 and TAWI50 withholding tax records. Supports soft-delete via `isArchived` flag.

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-employees` | List; optional `showArchived` param (default: false) |
| `get-employee-by-id` | Single record lookup |
| `add-employee` | Create employee |
| `update-employee` | Update employee fields |
| `delete-employee` | Soft delete via `isArchived = true` |

## Data Model

**Employee** — `id`, `name`, `taxId`, `baseSalary`, Thai decomposed address fields, `isArchived`, `businessId`, `createdAt`, `updatedAt`

## Business Rules

- Soft delete via `isArchived` — records are retained for tax history
- `showArchived` filter on list query is optional; defaults to false (excludes archived)
- No duplicate validation enforced at service level
- All fields are null-safe (null coalescing applied)
- Missing employee returns `error.notFound`

## Known Issues
[]
