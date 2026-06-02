---
id: 02-invoice-quotation
title: Invoice & Quotation — Create, Manage, Duplicate, XML Export
edition: MDD
depends_on: [01-core-infrastructure, 03-clients, 04-businesses, 13-banks, 12-style-profiles, 19-currencies]
relates: [15-presets, 17-pdf-export, 16-import-export]
source_files:
  - src/backend/shared/services/invoices.ts
  - src/backend/main/ipc/invoices.ts
  - src/renderer/pages/invoices
  - src/renderer/pages/quotes
routes: []
models:
  - invoices
  - invoice_items
  - invoice_payments
  - attachments
  - invoice_bank_snapshots
  - invoice_business_snapshots
  - invoice_client_snapshots
  - invoice_currency_snapshots
  - invoice_style_profile_snapshots
  - invoice_item_snapshots
  - invoice_sequences
  - invoice_customizations
test_files: []
data_flow: greenfield
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [invoice, quotation, pdf, xml, einvoice, snapshot, sequence]
path: Invoices/Core
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Invoice & Quotation

## Purpose

Core document feature. Handles creation, editing, duplication, and deletion of invoices and quotations. Snapshots preserve the state of business/client/currency/bank/style at invoice creation time. Supports e-invoice XML export (Peppol/UBL/XRechnung).

## IPC Channels

| Channel | Description |
|---------|-------------|
| `get-all-invoices` | List with filters (business, client, status, date range, archived) |
| `add-invoice` | Create invoice with items, payments, attachments |
| `update-invoice` | Replace all items/payments/attachments, update snapshots |
| `delete-invoice` | Hard delete |
| `duplicate-invoice` | Clone; converts quotation → invoice if source is a quotation |
| `get-next-sequence` | Get next auto-number for a business/client pair |
| `get-custom-headers` | Retrieve custom column headers |
| `get-einvoice-xml` | Generate Peppol/UBL/XRechnung XML, returns UTF-8 Buffer |

## Data Models

**Invoice** — core fields: `id`, `invoiceType` (invoice|quotation), `status`, `invoiceNumber`, `issueDate`, `dueDate`, `businessId`, `clientId`, `currencyId`, `bankId`, `styleProfileId`, `language`, `customerNotes`, `termsConditionNotes`, `thanksNotes`, `signatureData`, `isArchived`, `convertedFromQuotationId`

**Snapshots** — denormalised copies of business/client/currency/bank/style taken at creation time so the invoice remains accurate even if master data changes later.

**InvoiceSequence** — tracks next invoice number per `(businessId, clientId)` pair.

## Business Rules

- Items, payments, and attachments are fully replaced on update (delete all, re-insert)
- Custom field values in items are JSON-stringified
- `dueDate` auto-set to 2 months from `issueDate` on duplication if original had a due date
- Duplicate quotation → invoice sets `convertedFromQuotationId`
- Invoice number must be unique per business
- `processSequence` handles first-invoice case (no existing sequence row)
- Filters: business name, client name, status, archived flag, date range

## Edge Cases

- Empty invoice list returns empty array (not error)
- XML export converts result to UTF-8 Buffer before sending over IPC
- Update replaces all child records atomically; rollback on partial failure

## Known Issues
[]
