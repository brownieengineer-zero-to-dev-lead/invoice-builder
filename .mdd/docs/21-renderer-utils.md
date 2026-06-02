---
id: 21-renderer-utils
title: Renderer Utilities — Formatting, Calculation, Validation, File I/O
edition: MDD
depends_on: []
relates: [02-invoice-quotation, 17-pdf-export, 18-reports-dashboard]
source_files:
  - src/renderer/shared/utils/formatFunctions.ts
  - src/renderer/shared/utils/invoiceFunctions.ts
  - src/renderer/shared/utils/filterSortFunctions.ts
  - src/renderer/shared/utils/validatorFunctions.ts
  - src/renderer/shared/utils/typeGuardFunctions.ts
  - src/renderer/shared/utils/fileFunctions.ts
  - src/renderer/shared/utils/dataUrlFunctions.ts
  - src/renderer/shared/utils/generalFunctions.ts
  - src/renderer/shared/types/invoice.ts
  - src/renderer/shared/types/settings.ts
routes: []
models: []
test_files: []
data_flow: reads-existing
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [utils, format, currency, invoice, calculation, validation, excel, type-guard, filter, sort]
path: Core/Renderer Utils
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Renderer Utilities

## Purpose

Pure utility functions consumed by all renderer feature pages. Covers: date/currency formatting, invoice financial calculations, array filtering/sorting, form validation, exhaustive type guards, Excel import/export, and binary data URL conversion.

## Format Functions (`formatFunctions.ts`)

| Function | Description |
|----------|-------------|
| `toUTCISOString(date)` | Converts Date → UTC ISO string |
| `formatDate(str, pattern)` | Formats date with `date-fns` pattern |
| `formatAmount(n, settings)` | `Intl.NumberFormat` with locale-aware separators |
| `getFormattingMeta(format)` | Returns `{thousandSep, decimalSep}` per `AmountFormat` |
| `getFormattedCurrency(...)` | Formats amount with symbol/code placeholders |
| `createCurrencyFormatter(...)` | Memoized currency formatter function |
| `supportsCurrencySubunit(snap)` | Validates currency snapshot completeness |

## Invoice Financial Calculations (`invoiceFunctions.ts`)

| Function | Description |
|----------|-------------|
| `calcUnitPrice(cents, subunit)` | Converts DB cent value → display decimal |
| `calcTax(amount, rate, type)` | Tax: exclusive / inclusive / deducted modes |
| `calcDiscount(amount, value, type)` | Discount: fixed amount or percentage |
| `getInvoiceItemLevelTaxDiscount(item)` | Tax + discount for a single line item |
| `getInvoiceItemTotal(item)` | Line item total after tax/discount |
| `getInvoiceTotal(invoice)` | Grand total: items + invoice-level tax/discount |
| `getPaidAmount(payments)` | Sum of all payment amounts |
| `getBalanceDue(invoice)` | Total − paid |
| `getDaysLeft(dueDate)` | Days until due (negative = overdue) |
| `aggregateInvoicesByCurrency(invoices)` | Groups invoices by `currencyId`; returns sums |
| `getFinancialData`, `getItemFinancialData` | Financial summary helpers for reports |

## Filter & Sort (`filterSortFunctions.ts`)

| Function | Description |
|----------|-------------|
| `filterAndSortArray(arr, search, field, dir)` | Generic filter by `searchValue` + sort by field |
| `createCommonFilters()` | Standard filter set: all / active / archived |
| `createInvoiceFilters()` | Invoice filters: by count and age |

## Validators (`validatorFunctions.ts`)

`validators` object with regex-based methods:

| Method | Validates |
|--------|-----------|
| `email`, `phone`, `required` | Basic contact info |
| `sortCode`, `accountNumber`, `swift`, `routingNumber`, `branchCode` | Bank fields |
| `upiOrPix` | UPI / email / phone / CPF / UUID payment identifiers |
| `countryCode`, `peppolEndpointId`, `peppolEndpointSchemeId` | e-invoice standards |

Also: `validateOnlyNumbersLetters(str)` — alphanumeric check.

## Type Guards (`typeGuardFunctions.ts`)

Exhaustive runtime guards for import validation and snapshot checking:

- Entity guards: `isBusinessFromData`, `isClientFromData`, `isItemFromData`, `isUnitFromData`, `isCategoryFromData`, `isCurrencyFromData`, `isBankFromData`, `isPresetFromData`, `isStyleProfileFromData`
- Invoice snapshot guards: `isInvoiceBankSnapshotFromData`, `isInvoiceBusinessSnapshotFromData`, `isInvoiceClientSnapshotFromData`, `isInvoiceCurrencySnapshotFromData`, `isInvoiceCustomizationFromData`, `isInvoiceFromData`
- Helpers: `isValidCurrencyFormat`, `isPDFText`, `isSortOrder`, `isRecord`

## File I/O (`fileFunctions.ts`)

| Function | Description |
|----------|-------------|
| `exportExcel(data, filename)` | ExcelJS → `.xlsx` download via `file-saver` |
| `importExcel(file)` | Reads `.xlsx`; parses headers + rows; returns typed data |

## Data URL (`dataUrlFunctions.ts`)

| Function | Description |
|----------|-------------|
| `toDataUrl(blob)` | Blob / Uint8Array → base64 data URL string |
| `isDataUrl(str)` | Validates data URL format |
| `base64ToBytes(str)` | Decodes base64 → `Uint8Array` |
| `toUint8Array(src)` | Normalises Blob / File / ArrayBuffer / Uint8Array → `Uint8Array` |

## Key Types (`types/invoice.ts`, `types/settings.ts`)

**`Invoice`** — full invoice aggregate including all snapshots, items, payments, attachments, customisation.

**`InvoiceFromData`** — mutable form state for editing.

**`Settings`** — 14 fields including `language`, `amountFormat`, `dateFormat`, `theme`, and feature flags: `presetsON`, `quotesON`, `reportsON`, `ublON`, `xrechnungON`.

**`PdfTexts`** — 23 label keys for PDF internationalisation.

## Known Issues
[]
