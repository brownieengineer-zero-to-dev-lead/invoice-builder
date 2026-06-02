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
  - src/renderer/shared/enums/menuItemSettings.ts
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
last_synced: 2026-06-03
status: draft
phase: 1
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
  User clicks "ถอนสิทธิ์"
  → IPC: 'revoke-license'
  Main process:
    cancelKey = HMAC-SHA256(requestKey, CANCEL_SECRET_EMBEDDED)
    rotate salt (new random 32-byte salt → new requestKey for next activation)
    clear stored activationCode from secure storage
  → return cancelKey to renderer
  Renderer shows cancelKey → user sends to Support

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

### licenses.txt (Support POC — เก็บฝั่ง Support เท่านั้น)
```
# format: serialNumber | requestKey | status | activatedAt | canceledAt
SN-001 | <requestKey> | active | 2026-06-03 |
SN-002 | <requestKey> | canceled | 2026-06-01 | 2026-06-02
```

## API Endpoints (IPC Channels)

### `get-license-state` → `LicenseState`
ดึงสถานะ License ปัจจุบัน พร้อม requestKey สำหรับแสดงในหน้า Activation

**Response:**
```typescript
type LicenseState = {
  status: 'unlicensed' | 'active';
  requestKey: string;          // base32-encoded hash (20 chars, เพื่อ user-friendly)
  serialNumber?: string;
  activatedAt?: string;        // ISO date
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
ถอนสิทธิ์ — คำนวณ cancelKey, หมุน salt ใหม่, ล้าง activation จาก secure storage

**Response:**
```typescript
type RevokeResult = {
  cancelKey: string;    // hex string — ส่งให้ Support
  requestKey: string;   // requestKey ใหม่ (จาก salt ใหม่)
}
```

## Business Rules

1. **First launch gate**: ถ้า `get-license-state` คืน `status: 'unlicensed'` → renderer แสดง `ActivationModal` บังหน้าจอ ก่อนโหลด content
2. **requestKey derivation**: `HMAC-SHA256(hardwareId, salt)` → 32 bytes → encode เป็น Base32 (A-Z2-7) → uppercase → format xxxxxx-xxxxxx-xxxxxx-xxxxxx (24 chars)
3. **activationCode = Ed25519 signature** over `requestKey` (UTF-8) — 64 bytes → Base32 uppercase (A-Z, 2-7) → 104 chars → จัดกลุ่ม 8 ตัวคั่น `-` เป็น 13 กลุ่ม
4. **Verification**: decode Base32 → 64 bytes → `ed25519.verify(bytes, Buffer.from(requestKey, 'utf8'), PUBLIC_KEY_BYTES)`
5. **Salt rotation on revoke**: generate 32 new random bytes, save to secure storage, invalidates all previous activationCodes
6. **cancelKey**: `HMAC-SHA256(requestKey, CANCEL_SECRET)` → hex — `CANCEL_SECRET` hardcoded ใน app (obfuscated) และใน support tool
7. **Serial Number บน machines**: POC — 1 serial = 1 machine ต่อครั้ง; รองรับ future `maxMachines` field ใน payload โดย Support sign `{requestKey, serialNumber, maxMachines?, expiresAt?}` แทน `requestKey` เดิม (design extension, ยังไม่ implement ใน phase นี้)
8. **Platform storage**:
   - macOS: ใช้ `keytar` (Electron's keytar) เก็บใน Keychain under service `invoice-builder`
   - Windows: ใช้ `winreg` เก็บใน `HKCU\Software\InvoiceBuilder`

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
