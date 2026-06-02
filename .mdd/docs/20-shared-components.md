---
id: 20-shared-components
title: Shared UI Components — Controls, Inputs, Layout, Lists, Feedback, Modals
edition: MDD
depends_on: [19-renderer-api-layer]
relates: [17-pdf-export, 12-style-profiles]
source_files:
  - src/renderer/shared/components/controls/
  - src/renderer/shared/components/feedback/
  - src/renderer/shared/components/inputs/
  - src/renderer/shared/components/layout/
  - src/renderer/shared/components/lists/
  - src/renderer/shared/components/modals/
routes: []
models: []
test_files: []
data_flow: reads-existing
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [components, mui, react, form, dnd, toast, theme, modal, filter, image-crop]
path: Core/Shared Components
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Shared UI Components

## Purpose

Project-wide component library built on MUI. Provides reusable controls, form inputs, layout shells, list renderers, feedback indicators, and modals used by all feature pages.

## Controls (`components/controls/`)

| Component | Description |
|-----------|-------------|
| `FilterSortBar` | Sort direction toggle + field selector dropdown (generic over sort field type) |
| `ImportExportButton` | Menu with import/export/template-download options; handles file input + toast errors |
| `UploadButton` | Image file upload with auto crop modal integration; validates `maxSizeMB` |

## Feedback (`components/feedback/`)

| Component | Description |
|-----------|-------------|
| `GlobalErrorBoundaryWrapper` | React Error Boundary; logs errors, dispatches toast fallback |
| `Toast` | MUI Snackbar + Alert; configurable severity, auto-hide, stacking offset |
| `ToastContainer` | Fixed-position container; stacks multiple toasts with offset calculation |
| `SpinnerOverlay` | Full-screen overlay (zIndex 1500) with centered CircularProgress |

## Inputs (`components/inputs/`)

| Component | Description |
|-----------|-------------|
| `AmountInput` | `NumericFormat` wrapper with currency separators, decimal bounds |
| `Datepicker` | UTC-aware date picker; dayjs + timezone plugins; clear button; readOnly display mode |
| `UTCDateRangePicker` | Two `Datepicker` instances with shared range state and clear-all |
| `SearchInput` | Paper-wrapped `InputBase` with SearchIcon |
| `UploadImage` | Draggable image square; shows crop modal; clear button; size-configurable |

## Layout (`components/layout/`)

| Component | Description |
|-----------|-------------|
| `ModalAppBar` | Toolbar with back button, title, custom action buttons, save button |
| `PageAppBar` | Renders `ModalAppBar` (modal) or `PageHeader` (inline) based on `isModal` prop |
| `PageHeader` | Left-aligned toolbar; optional back/close; spacer; custom buttons |
| `Content` | MUI Grid v2 wrapper with Card + CardContent for scrollable content |
| `ThemeProviderWrapper` | Light/dark theme toggle; persists to `localStorage`; detects OS preference |
| `SummaryCard` | Colored card with title, value, subtitle, custom bg/text colors |
| `CustomizationLayout` | 4-tab invoice customisation form (PageSetup / Branding / Table / TypographyLabels); JSON.stringify dirty detection |
| `TabPanel` | Hidden `role="tabpanel"` that conditionally renders children |

## Lists (`components/lists/`)

| Component | Description |
|-----------|-------------|
| `SortableItem` | DnD Kit (`useSortable`) drag wrapper; attaches listeners to `data-drag-handle` elements |
| `GenericList` | Item card with avatar, name, email, phone, invoice/quote counts, archived chip, delete button |
| `MenuList` | Collapsible hierarchical list with badges, switches, tooltips; supports text/tooltip modes |
| `NoItem` | Centered empty-state with icon, message, and optional action node |

## Modals (`components/modals/`)

| Component | Description |
|-----------|-------------|
| `BottomFilterSheet` | `SwipeableDrawer` with radio groups, autocomplete, date range, chip toggles |
| `CropModal` | Full-screen Dialog; canvas-based image crop (ReactCrop); zoom/pan; outputs Blob |
| `Confirmation` | Standard confirm dialog with cancel/confirm buttons |

## Cross-Cutting Patterns

- **Redux:** `useAppDispatch` / `useAppSelector` for toasts and settings
- **i18n:** `react-i18next` `t()` for all user-facing strings including aria labels
- **Theming:** MUI `sx` prop, `useTheme()`, responsive `useMediaQuery`; custom `customBorder` palette extension
- **Validation:** `isFormValid` boolean propagated to save buttons; disabled-state description tooltips
- **Accessibility:** `aria-label`, `aria-labelledby`, `role`, `Tooltip` on icon-only buttons
- **File I/O:** File input refs, Blob handling, `toDataUrl` for base64, Excel import/export wrappers

## Known Issues
[]
