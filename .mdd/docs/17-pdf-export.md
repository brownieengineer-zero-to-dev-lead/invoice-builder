---
id: 17-pdf-export
title: PDF Export — Thai-Localised Invoice PDF Generation
edition: MDD
depends_on: [01-core-infrastructure, 12-style-profiles, 02-invoice-quotation]
relates: [09-pnd1-records, 10-tawi50-employee-records]
source_files:
  - src/renderer/shared/utils/pdfExports/pdfExportHelpers.ts
  - src/renderer/shared/utils/pdfExports/pnd1PdfExport.ts
  - src/renderer/shared/utils/pdfExports/pnd3PdfExport.ts
  - src/renderer/shared/utils/pdfExports/tawi50ContractorPdfExport.ts
  - src/renderer/shared/utils/pdfExports/tawi50EmployeePdfExport.ts
  - src/renderer/shared/utils/pdfFormFiller.ts
  - src/renderer/shared/utils/whtPdfExport.ts
routes: []
models: []
test_files: []
data_flow: reads-existing
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [pdf, thai, buddhist-calendar, address, pnd1, pnd3, tawi50, wht]
path: Export/PDF
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# PDF Export

## Purpose

Renderer-side PDF generation utilities. Handles Thai-localised formatting (Buddhist calendar, Thai address structure, Thai month names) and generates form PDFs for tax documents (PND1, PND3, TAWI50, WHT).

## Key Utilities (`pdfExportHelpers.ts`)

| Function | Description |
|----------|-------------|
| `formatThaiDate(date)` | Converts to Buddhist calendar (year + 543) |
| `thaiDateParts(date)` | Returns `{day, month, year}` with Thai month names |
| `buildAddress(entity)` | Filters empty parts, formats with Thai location labels |
| `formatAmount(n)` | `en-US` locale, 2 decimal places |
| `formatIdCard(id)` | Validates 13-digit Thai ID, adds spacing |
| `deliveryMethodCheckField(method)` | Maps delivery method string to 4-checkbox flags |

## Address Model

**AddressEntity** — 11 optional fields: `addressBuilding`, `addressRoomFloor`, `addressVillage`, `addressNo`, `addressMoo`, `addressSoi`, `addressRoad`, `addressSubDistrict`, `addressDistrict`, `addressProvince`, `addressPostalCode`

## Business Rules

- Dates use `dayjs` library
- Invalid dates return empty string (no crash)
- ID card reformatting validates length (must be 13 digits) before applying pattern
- `buildAddress` filters falsy values before joining
- `deliveryMethodCheckField` hardcodes 4 checkbox options; matches by method string
- Buddhist calendar offset is always +543 years

## Known Issues
[]
