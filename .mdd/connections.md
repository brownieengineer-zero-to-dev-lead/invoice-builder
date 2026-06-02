---
generated: 2026-06-02
doc_count: 21
connection_count: 36
overlap_count: 0
---

# MDD Connections

## Path Tree

```
App/
  ├── Import Export         16-import-export          complete
  ├── Settings              11-settings               complete
  └── Style Profiles        12-style-profiles         complete

Catalog/
  ├── Banks                 13-banks                  complete
  ├── Items                 05-items                  complete
  ├── Presets               15-presets                complete
  └── Reference Data        14-categories-units-currencies  complete

Contacts/
  ├── Businesses            04-businesses             complete
  ├── Clients               03-clients                complete
  ├── Contractors           07-contractors            complete
  └── Employees             06-employees              complete

Core/
  └── Infrastructure        01-core-infrastructure    complete

Export/
  └── PDF                   17-pdf-export             complete

Core/
  ├── Infrastructure        01-core-infrastructure    complete  (also listed above)
  ├── Renderer API          19-renderer-api-layer     complete
  ├── Shared Components     20-shared-components      complete
  └── Renderer Utils        21-renderer-utils         complete

Reports/
  └── Dashboard             18-reports-dashboard      complete

Invoices/
  └── Core                  02-invoice-quotation      complete

Meta/
  └── Schema                00-frontmatter-spec       complete

Tax/
  ├── PND1                  09-pnd1-records           complete
  ├── TAWI50                10-tawi50-employee-records complete
  └── WHT Transactions      08-wht-transactions       complete
```

## Dependency Graph

```mermaid
graph TD
  01[01-core-infrastructure]:::complete
  02[02-invoice-quotation]:::complete
  03[03-clients]:::complete
  04[04-businesses]:::complete
  05[05-items]:::complete
  06[06-employees]:::complete
  07[07-contractors]:::complete
  08[08-wht-transactions]:::complete
  09[09-pnd1-records]:::complete
  10[10-tawi50-employee-records]:::complete
  11[11-settings]:::complete
  12[12-style-profiles]:::complete
  13[13-banks]:::complete
  14[14-categories-units-currencies]:::complete
  15[15-presets]:::complete
  16[16-import-export]:::complete
  17[17-pdf-export]:::complete
  18[18-reports-dashboard]:::complete
  19[19-renderer-api-layer]:::complete
  20[20-shared-components]:::complete
  21[21-renderer-utils]:::complete

  02 --> 01
  02 --> 03
  02 --> 04
  02 --> 13
  02 --> 12
  02 --> 14
  03 --> 01
  04 --> 01
  05 --> 01
  05 --> 14
  06 --> 01
  06 --> 04
  07 --> 01
  08 --> 01
  08 --> 07
  08 --> 04
  09 --> 01
  09 --> 06
  09 --> 04
  10 --> 01
  10 --> 06
  11 --> 01
  12 --> 01
  13 --> 01
  14 --> 01
  15 --> 01
  15 --> 04
  15 --> 03
  15 --> 14
  15 --> 13
  15 --> 12
  16 --> 01
  17 --> 01
  17 --> 12
  17 --> 02
  18 --> 02
  18 --> 14
  19 --> 01
  20 --> 19
  21 --> 02

  classDef complete fill:#00e5cc,color:#000
  classDef in_progress fill:#ffaa00,color:#000
  classDef draft fill:#888,color:#fff
  classDef deprecated fill:#555,color:#aaa
```

## Source File Overlap

(no files referenced by 2+ docs)

## Warnings

(none)
