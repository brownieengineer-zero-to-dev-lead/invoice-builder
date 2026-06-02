---
id: 19-renderer-api-layer
title: Renderer API Layer — IPC/REST Abstraction, Redux Store, Core Hooks
edition: MDD
depends_on: [01-core-infrastructure]
relates: [02-invoice-quotation, 16-import-export, 20-shared-components]
source_files:
  - src/renderer/shared/api/
  - src/renderer/shared/hooks/ayncAction/
  - src/renderer/shared/hooks/form/
  - src/renderer/shared/hooks/dbSelector/
  - src/renderer/shared/hooks/other/
  - src/renderer/shared/hooks/backup/
  - src/renderer/shared/context/
  - src/renderer/state/configureStore.ts
  - src/renderer/state/pageSlice.ts
routes: []
models: []
test_files: []
data_flow: reads-existing
last_synced: 2026-06-02
status: complete
phase: all
mdd_version: 11
tags: [api, ipc, redux, electron, web, hooks, form, navigation, toast, async]
path: Core/Renderer API
integration_contracts: []
satisfies_contracts: []
security_read_sites: []
known_issues: []
---

# Renderer API Layer

## Purpose

Transparent dual-mode API abstraction that routes calls through Electron IPC (`window.electronAPI`) or HTTP REST (web mode). Also provides the Redux store, global UI state slice, and a set of infrastructure hooks consumed by all feature pages.

## API Layer (`src/renderer/shared/api/`)

```
getApi()  →  detects window.electronAPI presence
  ├─ Electron mode: routes to window.electronAPI.invoke(channel, args)
  └─ Web mode:      routes to fetch(VITE_API_URL || window.location.origin)

webApi()  →  40+ methods covering all domain entities (CRUD + batch)
```

**Key patterns:**
- Every method returns `Promise<Response<T>>` — consistent wrapper across both modes
- File data (logos, attachments, QR codes) mapped to/from base64 ↔ Uint8Array at the boundary
- Import payload gzip-compressed before sending via FormData (web mode only)
- `FilterData[]` passed to all list queries

## Redux Store (`src/renderer/state/`)

**`configureStore.ts`** — single reducer (`pageSlice`), typed `useAppDispatch` / `useAppSelector` hooks.

**`pageSlice.ts`** — global UI state:

| State field | Purpose |
|-------------|---------|
| `isLoading` | Spinner overlay visibility |
| `toasts` | Active snackbar notifications (UUID-keyed) |
| `settings` | Cached app settings (language, formats, feature flags) |
| `isAllowedToLeave` | Navigation block flag (dirty forms) |
| `version` / `newVersion` / `updateMessage` | Auto-updater state |

Feature flags in `settings`: `presetsON`, `quotesON`, `reportsON`, `ublON`, `xrechnungON`

⚠️ `enableLoadingCursor`/`disableLoadingCursor` reducers directly mutate `document.body.style` — a side effect inside a Redux reducer (intentional workaround for cursor feedback).

## Infrastructure Hooks

### `useAsync<T>` / `useAsyncAction<T>`

```
useAsync      → wraps Promise with {data, loading, error, execute}
useAsyncAction → adds Redux cursor + i18n-translated toast on error
```

- `showLoader` toggle disables cursor feedback when false
- Error messages: translated via `i18n.exists()` if key matches, else shown raw
- `onDone` callback fires after successful execution

### `useForm<T>` / `useFormDirtyCheck<T>`

```
useForm          → {form, updateForm(key, value)}
useFormDirtyCheck → compares JSON.stringify(initial) vs current; dispatches setAllowed(false) when dirty
```

Dirty check blocks navigation by setting `isAllowedToLeave = false` in Redux.

### `useBeforeLeave`

Wraps react-router-dom `useBlocker`. Shows confirmation dialog when navigating away from a dirty form. Defers the actual navigation action via a `pendingAction` ref until confirmed.

### `useDBSelector` / `useDBOpener` / `useDBInit` / `useTestConnection`

Thin wrappers over `useAsyncAction` for database lifecycle operations (open file picker, list DBs, initialise, test Postgres connection).

### `useExportJson` / `useImportJson`

Async wrappers over `getApi().exportAllData()` and `importAllData()`.

### `BeforeUnloadProvider` (context)

Minimal React context (2 functions: `attemptNavigation`, `setBlocked`) for sharing navigation-block state across the component tree without prop drilling.

## Known Issues
[]
