---
id: 06-employees
title: Employees — WHT Payroll Entity Management
edition: MDD
depends_on: [01-core-infrastructure, 04-businesses]
relates: [09-pnd1-records, 10-tawi50-employee-records]
source_files:
  - src/backend/shared/services/employees.ts
  - src/backend/main/ipc/employees.ts
  - src/renderer/pages/employees/index.tsx
  - src/renderer/pages/employees/List.tsx
  - src/renderer/pages/employees/Form.tsx
routes: []
models: [employees]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [employee, payroll, wht, archive, crud, filter]
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

## Renderer Architecture

`index.tsx` uses `CRUDPage` with domain hooks. A `filterToShowArchived` mapper converts `FilterData[]` → `showArchived?: boolean` for the retrieve hook.

```
EmployeesPage
  └─ CRUDPage
       ├─ filters: [all, active (default), archived]  → filterToShowArchived → useEmployeesRetrieve(showArchived)
       ├─ sortOptions: [name, baseSalary]
       ├─ renderListItem → List (card: name, baseSalary, taxId)
       └─ form → Form (name, taxId, baseSalary, address fields, businessId)
```

**`List.tsx`** — card component: shows `name` (truncated), `baseSalary` (formatted), `taxId`. Highlights selected item with theme-aware background.

**`Form.tsx`** — prop interface: `onChange(data: { changedData: FormData; isFormValid: boolean })`. Form is valid when `name` and `taxId` are non-empty.

## Business Rules

- Soft delete via `isArchived` — records are retained for tax history
- Active filter (default) excludes archived; archived filter shows only archived; all shows both
- `showArchived` mapped from `FilterData[]`: `active → false`, `archived → true`, `all → undefined`
- No duplicate validation enforced at service level
- All fields are null-safe (null coalescing applied)
- Missing employee returns `error.notFound`

## Known Issues
[]
