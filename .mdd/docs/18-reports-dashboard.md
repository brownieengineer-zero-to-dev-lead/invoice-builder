---
id: 18-reports-dashboard
title: Reports Dashboard — Financial Analytics & Revenue Charts
edition: MDD
depends_on: [02-invoice-quotation, 14-categories-units-currencies]
relates: [02-invoice-quotation, 03-clients, 05-items]
source_files:
  - src/renderer/pages/reports/index.tsx
  - src/renderer/pages/reports/Overview.tsx
  - src/renderer/pages/reports/FinancialCards.tsx
  - src/renderer/pages/reports/TrendChart.tsx
  - src/renderer/pages/reports/ClientsRevenueChart.tsx
  - src/renderer/pages/reports/ItemsSalesChart.tsx
  - src/renderer/pages/reports/Header.tsx
  - src/renderer/pages/reports/Modals/RangeSetter.tsx
  - src/renderer/pages/reports/CustomLegent.tsx
  - src/renderer/pages/reports/CustomTooltip.tsx
routes: []
models: [invoices, invoice_item_snapshots, invoice_client_snapshots, invoice_currency_snapshots]
test_files: []
data_flow: reads-existing
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [reports, analytics, charts, revenue, recharts, dashboard, currency]
path: Reports/Dashboard
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Reports Dashboard

## Purpose

Read-only financial analytics dashboard. Aggregates invoice data by currency and renders three chart types: cumulative revenue trend, client revenue distribution, and item sales breakdown. Users filter by date range and currency.

## Components

| Component | Description |
|-----------|-------------|
| `ReportsPage` | Main container; manages `dateRange` and `selectedCurrency` state |
| `Header` | Currency dropdown + date preset selector (7 presets + custom modal) |
| `Overview` | Filters invoices by date/currency; transforms raw data into chart datasets |
| `FinancialCards` | 4 summary cards: total amount, collection rate %, collected, outstanding |
| `TrendChart` | Line chart — cumulative revenue over time (X: date, Y: amount in thousands) |
| `ClientsRevenueChart` | Donut (Pie) chart — revenue by client with percentage labels |
| `ItemsSalesChart` | Donut (Pie) chart — sales by item with quantity + amount in legend |
| `RangeSetter` | Custom date range modal with two `Datepicker` inputs |
| `CustomTooltip` | Recharts tooltip showing formatted date + amount for trend chart |
| `CustomLegend` | Legend row: colour indicator, name, count/quantity, revenue |

## Data Sources

- `useInvoicesRetrieve` hook — fetches invoices of type `'invoice'` (not quotations)
- `aggregateInvoicesByCurrency` utility — groups invoice list by `currencyId`
- Redux `selectSettings` — provides `amountFormat` and `dateFormat` preferences
- Snapshot fields on invoices (`invoiceCurrencySnapshot`, `invoiceClientSnapshot`, `invoiceItemSnapshots`) provide historical data

## Filters & Controls

| Control | Options |
|---------|---------|
| Currency dropdown | Populated from invoice data; defaults to first available |
| Date preset | Last 30 days, this month, last month, this quarter, last quarter, this year, last year |
| Custom range | Modal with from/to date pickers (`RangeSetter`) |

## Business Rules

- Invoices filtered by `issuedDate` within the selected date range
- Invoice totals calculated via `getInvoiceTotal` (applies tax, discount, shipping)
- Amounts divided by `currencySubunit` to convert from cents to display value
- **Trend data:** sorted chronologically, accumulated cumulatively
- **Client chart:** groups by `clientName` snapshot; counts invoices per client
- **Item chart:** groups by item name; sums quantities and totals
- **Financial cards:**
  - Total = sum of all invoice totals
  - Collection rate = paid / total × 100
  - Collected = sum of paid invoice totals
  - Outstanding = sum of unpaid invoice totals
- Pie slice colours: randomly generated HSL (hue varies, 70% saturation, 50% lightness)

## Dependencies

- `recharts` — LineChart, PieChart, ResponsiveContainer
- `date-fns` — date range calculations (parseISO, startOf/endOf month/quarter/year, subDays/Months)
- `@mui/material` — layout, dropdowns, dialog
- `useInvoicesRetrieve`, `formatAmount`, `formatDate`, `aggregateInvoicesByCurrency`, `getInvoiceTotal`

## Known Issues
[]
