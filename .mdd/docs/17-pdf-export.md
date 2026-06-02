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

---

## Core PDF Utilities (`pdfFormFiller.ts`)

Low-level primitives used by all `build*` and `export*` functions. All higher-level code composes from these three steps.

| Export | Signature | Description |
|--------|-----------|-------------|
| `loadPDF` | `(templateUrl: string) → Promise<PDFDocument>` | Fetches and parses a PDF template |
| `fillForm` | `(pdf, fields, fontSizes?) → Promise<void>` | Embeds TH Sarabun New font, fills all form fields in-place. Skips missing fields silently. |
| `getUrlFromPDF` | `(pdf, mode) → Promise<string>` | Saves PDF to a blob URL. `'preview'` flattens form fields first; `'export'` keeps fields interactive. |
| `mergePdfDocs` | `(docs: PDFDocument[]) → Promise<PDFDocument>` | Merges multiple `PDFDocument` objects into one by copying pages. Does not copy AcroForm — see contractor note below. |
| `PdfFieldValues` | type | `Record<string, string \| boolean \| number \| undefined \| null>` — field value map passed to `fillForm` |

### Field type handling in `fillForm`

| Value type | Behaviour |
|------------|-----------|
| `string` | Sets text field, applies font size (default 14pt) |
| `boolean` | Checks / unchecks checkbox |
| `number` | Selects radio group option by widget index |
| `null` / `undefined` | Skipped |

---

## Build / Preview / Export Pattern

All document types follow the same three-step pattern:

```
build*(...)           → PDFDocument   (filled, not yet rendered)
  └─ getUrlFromPDF(pdf, 'preview')    → blob URL with flattened form  (for iframe)
  └─ getUrlFromPDF(pdf, 'export')     → blob URL with interactive form (for download)
```

**Preview pages** call `build*` then `getUrlFromPDF(pdf, 'preview')` to get a flattened blob URL for the `<iframe>`.

**Download handlers** call `build*` again (fresh PDF object) then `getUrlFromPDF(pdf, 'export')` and trigger `a.click()`.

**Export functions** (`export*`) are convenience wrappers that build + download in one call.

---

## Document Build Functions

Each function returns `PDFDocument` (filled, not yet saved). Callers apply `getUrlFromPDF` with the desired mode.

| Function | File | Document |
|----------|------|----------|
| `buildPnd1MonthlySummary(summary, business)` | `pnd1PdfExport.ts` | ภ.ง.ด.1 monthly summary |
| `buildPnd3(summary, business)` | `pnd3PdfExport.ts` | ภ.ง.ด.3 / ภ.ง.ด.53 |
| `buildTawi50Employee(record, employee, business)` | `tawi50EmployeePdfExport.ts` | 50 ทวิ พนักงาน |
| `buildWhtTransaction12(transaction, contractor, business, mode?)` | `tawi50ContractorPdfExport.ts` | 50 ทวิ ผู้รับจ้าง ฉบับ 1–2 (merged) |
| `buildWhtTransaction34(transaction, contractor, business, mode?)` | `tawi50ContractorPdfExport.ts` | 50 ทวิ ผู้รับจ้าง ฉบับ 3–4 (merged) |

> **Contractor mode parameter** — `buildWhtTransaction12/34` accept an optional `mode: 'preview' | 'export'` (default `'export'`). When `'preview'`, each of the two source PDFs is flattened **before** `mergePdfDocs` is called. This is required because `mergePdfDocs` copies page content only — the merged doc has no AcroForm, so calling `flatten()` on it afterwards is a no-op. Preview pages must pass `'preview'` explicitly.

---

## Export (Download) Functions

Convenience wrappers: build + `getUrlFromPDF(pdf, 'export')` + `a.click()`. Called from page-level "ดาวน์โหลด" action handlers.

| Function | Filename |
|----------|----------|
| `exportPnd1MonthlySummary(summary, business)` | `pnd1-<month>-<year>.pdf` |
| `exportPnd3(summary, business)` | `pnd3-<month>-<year>.pdf` or `pnd53-...` |
| `exportTawi50Employee(record, employee, business)` | `tawi50-employee-<name>-<year>.pdf` |
| `exportTawi50ContractorCopies12(transaction, contractor, business)` | `tawi50-contractor-<name>-12.pdf` |
| `exportTawi50ContractorCopies34(transaction, contractor, business)` | `tawi50-contractor-<name>-34.pdf` |

---

## Barrel Export (`whtPdfExport.ts`)

Re-exports everything from all four `pdfExports/` files for backward-compatible import paths:

```ts
export * from './pdfExports/pnd1PdfExport';
export * from './pdfExports/tawi50EmployeePdfExport';
export * from './pdfExports/tawi50ContractorPdfExport';
export * from './pdfExports/pnd3PdfExport';
```

---

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
- `fillForm` uses Thai Sarabun New Bold font embedded via `@pdf-lib/fontkit`; default font size 14pt
- `getUrlFromPDF` mutates the `PDFDocument` when flattening — do not reuse the same object for both preview and export; call `build*` twice (once per use)

## Known Issues
[]
