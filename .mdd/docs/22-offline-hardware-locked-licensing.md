---
id: 22-offline-hardware-locked-licensing
title: Offline Hardware-Locked Licensing — Ed25519 Activation & Revocation
edition: Invoice Builder
depends_on: [01-core-infrastructure, 11-settings]
relates: [11-settings]
source_files:
  - src/backend/main/ipc/license.ts
  - src/backend/main/license/hardwareId.ts
  - src/backend/main/license/licenseStore.ts
  - src/backend/main/license/licenseVerify.ts
  - src/backend/main/license/constants.ts
  - src/preload/preload.ts
  - src/renderer/shared/types/license.ts
  - src/renderer/pages/activation/ActivationModal.tsx
  - src/renderer/pages/settings/content/LicenseSettings.tsx
  - src/renderer/pages/settings/menu/Menu.tsx
  - src/renderer/app/App.tsx
  - src/renderer/shared/enums/menuItemSettings.ts
  - src/renderer/i18n/en.json
  - src/renderer/i18n/th.json
  - src/renderer/i18n/de.json
  - src/renderer/i18n/fr.json
  - src/renderer/i18n/lt.json
  - support-tools/generate-keys.js
  - support-tools/generate-activation.js
  - support-tools/verify-cancel.js
  - support-tools/licenses.txt
  - support-tools/config.js
routes: []
models: []
test_files:
  - src/tests/unit/license.test.ts
data_flow: greenfield
last_synced: 2026-06-04
status: complete
phase: all
mdd_version: 11
tags: [licensing, hardware-lock, ed25519, activation, revocation, electron, security, keychain, registry]
path: Settings/License
integration_contracts: []
satisfies_contracts: []
known_issues: []
security_read_sites:
  - src/backend/main/license/licenseStore.ts
  - src/backend/main/license/licenseVerify.ts
sister_projects: []
---

# 22 — Offline Hardware-Locked Licensing

## Purpose

ป้องกันการใช้งานโปรแกรมโดยไม่ได้รับอนุญาต โดย License จะผูกกับ Hardware ID ของเครื่องแต่ละเครื่อง ไม่ต้องการ Internet — ทุก flow เป็น Manual (อีเมล) รองรับการโอน License ไปเครื่องใหม่โดยผ่าน Support (Cancel/Revoke flow)

## Architecture

```
[First Launch]
  App Main Process
    → hardwareId.ts    (get CPU/board serial, cross-platform)
    → licenseStore.ts  (read/write salt from Keychain/Registry)
    → HMAC-SHA256(hardwareId + salt) → requestKey
    → IPC: 'get-license-state' → renderer

[Renderer — ActivationModal]
  User copies requestKey → sends to Support via email
  Support replies with activationCode
  User pastes activationCode → IPC: 'activate-license'

[Main Process — Activation]
  licenseVerify.ts:
    parse activationCode (Base32 decode → 64-byte Ed25519 signature)
    message = requestKey (UTF-8 bytes)
    verify(message, signature, EMBEDDED_PUBLIC_KEY) → boolean
  If valid: licenseStore.ts stores {activationCode, serialNumber, activatedAt}

[Renderer — Revocation (Settings/License)]
  User clicks "ยกเลิกใบอนุญาต" → confirm dialog → confirm
  → IPC: 'revoke-license'
  Main process:
    cancelKey = HMAC-SHA256(requestKey, CANCEL_SECRET_EMBEDDED)
    writeCancelKey(cancelKey) → เก็บลง secure storage
    clear stored activationCode from secure storage
    rotate salt (new random 32-byte salt → new requestKey for next activation)
  → return { cancelKey, requestKey } to renderer
  Renderer: window.location.reload()
    → App restarts → getLicenseState() → { status: 'unlicensed', cancelKey }
    → ActivationModal โผล่พร้อมแสดง cancelKey + warning
  User copies cancelKey → ส่งให้ Support

[Support Tool]
  verify-cancel.js:
    recompute HMAC-SHA256(requestKey, CANCEL_SECRET) == cancelKey?
    if yes: mark serial as freed in licenses.txt

[Support Tool — Activation]
  generate-activation.js:
    receives requestKey + serialNumber from user email
    signs requestKey with Ed25519 private key
    outputs activationCode (Base32 uppercase, 104 chars)
```

## Data Model

ไม่มี database table — ข้อมูล License เก็บใน secure OS storage:

### Secure Storage Schema (Keychain / Registry)
| Key | Type | Description |
|-----|------|-------------|
| `InvoiceBuilder/license-salt` | hex string (32 bytes) | random salt สำหรับ requestKey |
| `InvoiceBuilder/license-activation` | JSON string | `{activationCode, serialNumber, activatedAt}` |
| `InvoiceBuilder/license-cancel-key` | hex string | cancelKey จาก revoke ล่าสุด — เก็บไว้จนกว่า activate สำเร็จ |

### licenses.txt (Support POC — เก็บฝั่ง Support เท่านั้น)
```
# format: serialNumber | requestKey | status | activatedAt | canceledAt
SN-001 | <requestKey> | active | 2026-06-03 |
SN-002 | <requestKey> | canceled | 2026-06-01 | 2026-06-02
```

## API Endpoints (IPC Channels)

### `get-license-state` → `LicenseState`
ดึงสถานะ License ปัจจุบัน พร้อม requestKey สำหรับแสดงในหน้า Activation รวมถึง cancelKey (ถ้ามีจาก revoke ก่อนหน้า)

**Response:**
```typescript
type LicenseState = {
  status: 'unlicensed' | 'active';
  requestKey: string;          // base32-encoded hash (20 chars, เพื่อ user-friendly)
  serialNumber?: string;
  activatedAt?: string;        // ISO date
  cancelKey?: string;          // มีเฉพาะกรณีที่เคย revoke แต่ยังไม่ activate ใหม่
}
```

### `activate-license` (activationCode: string, serialNumber: string) → `ActivationResult`
รับ activationCode จาก Support มา verify กับ Ed25519 public key

**Request:** `{ activationCode: string, serialNumber: string }`
**Response:**
```typescript
type ActivationResult = {
  success: boolean;
  error?: 'invalid_signature' | 'already_active' | 'tampered';
}
```

### `revoke-license` → `RevokeResult`
ถอนสิทธิ์ — คำนวณ cancelKey, **บันทึก cancelKey ลง secure storage ก่อน**, หมุน salt ใหม่, ล้าง activation จาก secure storage

**Response:**
```typescript
type RevokeResult = {
  cancelKey: string;    // hex string — ส่งให้ Support
  requestKey: string;   // requestKey ใหม่ (จาก salt ใหม่)
}
```

> cancelKey ที่บันทึกใน storage จะถูก clear อัตโนมัติเมื่อ `activate-license` สำเร็จ

## Business Rules

1. **First launch gate**: ถ้า `get-license-state` คืน `status: 'unlicensed'` → renderer แสดง `ActivationModal` บังหน้าจอ ก่อนโหลด content
2. **requestKey derivation**: `HMAC-SHA256(hardwareId, salt)` → 32 bytes → encode เป็น Base32 (A-Z2-7) → uppercase → format xxxxxx-xxxxxx-xxxxxx-xxxxxx (24 chars)
3. **activationCode = Ed25519 signature** over `requestKey` (UTF-8) — 64 bytes → Base32 uppercase (A-Z, 2-7) → 104 chars → จัดกลุ่ม 8 ตัวคั่น `-` เป็น 13 กลุ่ม
4. **Verification**: decode Base32 → 64 bytes → `ed25519.verify(bytes, Buffer.from(requestKey, 'utf8'), PUBLIC_KEY_BYTES)`
5. **Salt rotation on revoke**: generate 32 new random bytes, save to secure storage, invalidates all previous activationCodes
6. **cancelKey persistence**: cancelKey บันทึกลง secure storage ทันทีเมื่อ revoke สำเร็จ — ถ้า user ปิด app ก่อนส่ง cancelKey ให้ Support จะยังเห็น cancelKey ใน ActivationModal ครั้งถัดไปที่เปิด app
7. **cancelKey cleared on activation**: เมื่อ `activate-license` สำเร็จ → `clearCancelKey()` ถูก call ทันที
8. **cancelKey**: `HMAC-SHA256(requestKey, CANCEL_SECRET)` → hex — `CANCEL_SECRET` hardcoded ใน app (obfuscated) และใน support tool
9. **Revoke flow → window reload**: หลัง revoke สำเร็จ → `window.location.reload()` → app restart → `dbReady = false` → DatabaseChooser โผล่ → ActivationModal แสดงทับพร้อม cancelKey
10. **Serial Number บน machines**: POC — 1 serial = 1 machine ต่อครั้ง; รองรับ future `maxMachines` field ใน payload โดย Support sign `{requestKey, serialNumber, maxMachines?, expiresAt?}` แทน `requestKey` เดิม (design extension, ยังไม่ implement ใน phase นี้)
11. **Platform storage**:
    - macOS/Linux: ใช้ `keytar` เก็บใน Keychain/Secret Service under service `invoice-builder`
    - Windows: ใช้ `winreg` เก็บใน `HKCU\Software\InvoiceBuilder`
    - Fallback: ถ้า keytar/winreg ล้มเหลว → เก็บใน `<userData>/.license-store.json`

## UI Components

### ActivationModal (`src/renderer/pages/activation/ActivationModal.tsx`)
- แสดงเมื่อ `licenseState.status === 'unlicensed'` ใน `App.tsx`
- Props: `requestKey`, `cancelKey?`, `onActivated`
- ถ้ามี `cancelKey` → แสดง Alert warning + cancel key box พร้อมปุ่ม copy ก่อน fields activation
- ใช้ `bgcolor: 'action.hover'` (theme-aware) แทน `grey.100` เพื่อ dark mode compatibility
- `disableEscapeKeyDown` — ปิดไม่ได้จนกว่าจะ activate

### LicenseSettings (`src/renderer/pages/settings/content/LicenseSettings.tsx`)
- แสดงใน Settings page เมื่อเลือก `MenuItemSettings.License`
- แสดง: status chip, serial number, activated at, request key, revoke section
- Revoke flow: Confirm Dialog → `revokeLicense()` → `window.location.reload()`
- ไม่มี `onRevoked` prop อีกต่อไป — ใช้ reload แทน

### App.tsx
- Fetch `licenseState` ครั้งเดียวตอน mount
- ถ้า `status === 'unlicensed'` → render `ActivationModal` ทับทุกอย่าง (รวม DatabaseChooser)
- หลัง activate → `getLicenseState()` ใหม่ → modal หาย → flow ปกติ

## i18n Keys

ทุก text ใน License feature ใช้ `useTranslation()` — ไม่มี hardcoded string ในหน้า renderer

### Namespaces ที่เพิ่ม (ทุก locale: en, th, de, fr, lt)

| Key | Usage |
|-----|-------|
| `license.statusSection` | หัวข้อ "สถานะใบอนุญาต" ใน LicenseSettings |
| `license.statusActive` / `license.statusInactive` | Chip แสดงสถานะ |
| `license.serialNumber` / `license.activatedAt` | ข้อมูล activation |
| `license.requestKeyLabel` | หัวข้อ Hardware Request Key |
| `license.requestKeyHint` | คำอธิบายใต้ request key box ใน ActivationModal |
| `license.activationTitle` | ชื่อ Dialog activation |
| `license.activationCode` | Label ช่อง activation code |
| `license.activateButton` | ปุ่ม activate |
| `license.revokeSection` | หัวข้อ revoke section |
| `license.revokeWarning` | Alert warning ก่อน revoke |
| `license.revokeButton` | ปุ่ม revoke |
| `license.revokeConfirmTitle` / `license.revokeConfirmBody` | Confirm dialog |
| `license.cancelKeyLabel` | หัวข้อ cancel key |
| `license.cancelKeyHint` | คำอธิบายใต้ cancel key box |
| `license.cancelKeyPendingWarning` | Alert warning ใน ActivationModal เมื่อมี pending cancelKey |
| `license.error.invalidSignature` | Error: signature ไม่ตรง |
| `license.error.alreadyActive` | Error: ใช้งานบนเครื่องอื่นอยู่ |
| `license.error.tampered` | Error: ข้อมูลถูกแก้ไข |
| `license.error.unknown` | Error: ไม่รู้จัก |
| `common.copy` / `common.copied` | ปุ่ม copy / หลัง copy สำเร็จ |
| `settingsMenuItems.titles.license` | ชื่อ menu item ใน Settings sidebar |
| `settingsMenuItems.descriptions.license` | คำอธิบาย menu item |

## Data Flow

Greenfield — ไม่มี existing code ที่ต้อง trace

## Dependencies

- `01-core-infrastructure`: Electron app entry point, IPC registration pattern, `app.getPath('userData')`
- `11-settings`: Settings page layout — ใส่ License menu item เพิ่มใน settings menu

## Security

**Threat model:**

| Threat | Mitigation |
|--------|-----------|
| User แก้ไขไฟล์ license ใน userData | ข้อมูลเก็บใน Keychain/Registry — user-level tampering ยากกว่า flat file |
| User copy activation code ไปใช้เครื่องอื่น | requestKey ผูกกับ hardwareId + salt ของเครื่องนั้นโดยเฉพาะ — signature verify ไม่ผ่านบนเครื่องอื่น |
| ดักจับ activationCode บน network | ไม่มี network — ทุก flow เป็น manual copy/paste |
| Reverse-engineer CANCEL_SECRET จาก binary | Secret obfuscated แต่ not cryptographically hidden — acceptable สำหรับ POC; production ควรใช้ code obfuscation tool |
| Replay old activationCode หลัง revoke | salt หมุนใหม่ → requestKey เปลี่ยน → signature verify ไม่ผ่านกับ requestKey ใหม่ |
| Private key leak | Private key อยู่ใน support-tools/ เท่านั้น, ไม่ commit ใน repo (gitignore), public key embed ใน app |

**Trusted inputs**: activationCode จาก user — validate เป็น Base32 string (104 chars) ก่อน decode และ verify  
**Untrusted**: activationCode, serialNumber — validate length/format ก่อน pass เข้า crypto

**CANCEL_SECRET**: hardcoded constant ใน `src/backend/main/license/constants.ts` — ไม่ใช่ key ลับสำหรับ data protection; ใช้เพื่อ verify authenticity ของ cancel request เท่านั้น

## Known Issues

(none — new feature)

## Bugs

(none yet — populated by /mdd bug when issues are reported)
