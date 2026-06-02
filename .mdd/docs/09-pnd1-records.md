---
id: 09-pnd1-records
title: PND1 Records — Monthly Employee Tax Filing
edition: MDD
depends_on: [01-core-infrastructure, 06-employees, 04-businesses]
relates: [08-wht-transactions, 10-tawi50-employee-records]
source_files:
  - src/backend/shared/services/pnd1Records.ts
  - src/backend/main/ipc/pnd1Records.ts
  - src/renderer/pages/pnd1/index.tsx
  - src/renderer/pages/pnd1/List.tsx
  - src/renderer/pages/pnd1/Form.tsx
  - src/renderer/pages/pnd1/EmployeesDropdown.tsx
  - src/renderer/pages/pnd1Monthly/index.tsx
routes: []
models: [pnd1_records]
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [pnd1, employee-tax, monthly-tax, thai-tax, withholding-tax, summary, filter]
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
| `get-all-pnd1-records` | List with optional `{employeeId?, month?, year?}` filter |
| `get-pnd1-record-by-id` | Single record |
| `add-pnd1-record` | Create; enforces uniqueness on `(employeeId, month, year)` |
| `update-pnd1-record` | Update record |
| `delete-pnd1-record` | Hard delete |
| `get-pnd1-monthly-summary` | Aggregated monthly summary `{month, year, businessId}` |

## Data Model

**Pnd1Record** — `id`, `employeeId`, `month`, `year`, `income`, `taxWithheld`, joined `employeeName`

**Pnd1MonthlySummary** — `month`, `year`, `businessId`, `rows[]` (Pnd1MonthlySummaryRow), `totalIncome`, `totalTax`

**Pnd1MonthlySummaryRow** — `id`, `employeeId`, `employeeName`, `taxId`, `income`, `taxWithheld`

## Renderer Architecture

### รายการเงินเดือน (`pnd1/index.tsx`)

`CRUDPage`-based list with server-side filter by employee, month, and year.

```
Pnd1Page
  ├─ filterRef.current = { employeeId?, month?, year? }   ← updated each render from state
  ├─ CRUDPage
  │    ├─ renderAboveSort → filterBar UI
  │    │    ├─ Chip (employee) → opens EmployeesDropdown drawer
  │    │    ├─ Select เดือน  (1–12, ภาษาไทย ม.ค.–ธ.ค.)
  │    │    ├─ Select ปี พ.ศ. (5 ปีย้อนหลัง)
  │    │    └─ Clear button (แสดงเมื่อมี filter ใดๆ)
  │    ├─ searchField: employeeName (client-side text search)
  │    └─ sortOptions: เดือน, ปี, ชื่อพนักงาน
  └─ EmployeesDropdown (SwipeableDrawer)
```

**Filter ref pattern:** `filterRef.current` ถูก assign ใหม่ทุก render จาก state → object reference ใหม่ทุกครั้งที่ filter เปลี่ยน → `usePnd1RecordsRetrieve` detect การเปลี่ยนแปลงและ re-fetch อัตโนมัติ

**`EmployeesDropdown`** — SwipeableDrawer ที่ embed `CRUDPage` แสดงรายชื่อพนักงาน (ไม่รวมที่ archive); callback `onClick(employee)` ส่ง employee ที่เลือกกลับมา

**`List.tsx`** — card แสดง: ชื่อพนักงาน (truncated), เดือน+ปี (เช่น "มิ.ย. 2569"), เงินได้, ภาษีหัก

### ปิดงบเงินเดือนรายเดือน (`pnd1Monthly/index.tsx`)

หน้าแยกสำหรับสรุป PND1 รายเดือน — ต้องเลือก business + เดือน + ปี ก่อนแสดงข้อมูล รองรับ export PDF

## Business Rules

- Duplicate `(employeeId, month, year)` returns `error.duplicateRecord`
- Monthly summary: joins employee names and taxIds, totals computed via reduce
- Hard delete
- Missing record returns `error.notFound`
- `month` และ `year` เก็บในรูป Buddhist Era (พ.ศ.) — ปี 2026 CE = 2569 พ.ศ.
- Filter บน `get-all-pnd1-records` ทำ server-side ผ่าน SQL WHERE clause (ไม่ใช่ client-side)
- Filter year range ใน UI: 5 ปีย้อนหลังจากปีปัจจุบัน (พ.ศ.)

## Known Issues
[]
