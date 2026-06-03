import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { app } from 'electron';
import { LICENSE_SERVICE, LICENSE_SALT_KEY, LICENSE_ACTIVATION_KEY, LICENSE_CANCEL_KEY } from './constants';
import { verifyActivationCode } from './licenseVerify';
import type { LicenseState, StoredActivation } from '../../../renderer/shared/types/license';

// ---------------------------------------------------------------------------
// File-based fallback storage (userData) — used when Keychain/Registry fails
// ---------------------------------------------------------------------------
function getFallbackPath(): string {
  return join(app.getPath('userData'), '.license-store.json');
}

function fallbackRead(key: string): string | null {
  try {
    const path = getFallbackPath();
    if (!existsSync(path)) return null;
    const store = JSON.parse(readFileSync(path, 'utf8'));
    return store[key] ?? null;
  } catch {
    return null;
  }
}

function fallbackWrite(key: string, value: string): void {
  const path = getFallbackPath();
  let store: Record<string, string> = {};
  try {
    if (existsSync(path)) store = JSON.parse(readFileSync(path, 'utf8'));
  } catch { /* start fresh */ }
  store[key] = value;
  writeFileSync(path, JSON.stringify(store), 'utf8');
}

function fallbackDelete(key: string): void {
  const path = getFallbackPath();
  try {
    if (!existsSync(path)) return;
    const store: Record<string, string> = JSON.parse(readFileSync(path, 'utf8'));
    delete store[key];
    writeFileSync(path, JSON.stringify(store), 'utf8');
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Platform-specific secure storage with file fallback
// ---------------------------------------------------------------------------
async function secureGet(key: string): Promise<string | null> {
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      const keytar = await import('keytar');
      return await keytar.default.getPassword(LICENSE_SERVICE, key);
    } else {
      return new Promise((resolve) => {
        const Registry = require('winreg');
        const reg = new Registry({ hive: Registry.HKCU, key: `\\Software\\InvoiceBuilder` });
        reg.get(key, (_err: unknown, item: { value: string } | null) => {
          resolve(item?.value ?? null);
        });
      });
    }
  } catch {
    return fallbackRead(key);
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      const keytar = await import('keytar');
      await keytar.default.setPassword(LICENSE_SERVICE, key, value);
    } else {
      return new Promise((resolve, reject) => {
        const Registry = require('winreg');
        const reg = new Registry({ hive: Registry.HKCU, key: `\\Software\\InvoiceBuilder` });
        reg.set(key, Registry.REG_SZ, value, (err: unknown) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  } catch {
    fallbackWrite(key, value);
  }
}

async function secureDelete(key: string): Promise<void> {
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      const keytar = await import('keytar');
      await keytar.default.deletePassword(LICENSE_SERVICE, key);
    } else {
      return new Promise((resolve) => {
        const Registry = require('winreg');
        const reg = new Registry({ hive: Registry.HKCU, key: `\\Software\\InvoiceBuilder` });
        reg.remove(key, () => resolve());
      });
    }
  } catch {
    fallbackDelete(key);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function readOrCreateSalt(): Promise<string> {
  const existing = await secureGet(LICENSE_SALT_KEY);
  if (existing) return existing;

  const newSalt = randomBytes(32).toString('hex');
  await secureSet(LICENSE_SALT_KEY, newSalt);
  return newSalt;
}

export async function rotateSalt(): Promise<string> {
  const newSalt = randomBytes(32).toString('hex');
  await secureSet(LICENSE_SALT_KEY, newSalt);
  return newSalt;
}

export async function writeLicenseActivation(data: StoredActivation): Promise<void> {
  await secureSet(LICENSE_ACTIVATION_KEY, JSON.stringify(data));
}

export async function clearLicenseActivation(): Promise<void> {
  await secureDelete(LICENSE_ACTIVATION_KEY);
}

export async function writeCancelKey(cancelKey: string): Promise<void> {
  await secureSet(LICENSE_CANCEL_KEY, cancelKey);
}

export async function readCancelKey(): Promise<string | null> {
  return secureGet(LICENSE_CANCEL_KEY);
}

export async function clearCancelKey(): Promise<void> {
  await secureDelete(LICENSE_CANCEL_KEY);
}

export async function readLicenseState(requestKey: string): Promise<LicenseState> {
  const raw = await secureGet(LICENSE_ACTIVATION_KEY);
  const cancelKey = await readCancelKey() ?? undefined;

  if (!raw) return { status: 'unlicensed', requestKey, cancelKey };

  try {
    const stored: StoredActivation = JSON.parse(raw);
    const { success } = verifyActivationCode(stored.activationCode, requestKey);
    if (!success) return { status: 'unlicensed', requestKey, cancelKey };
    return {
      status: 'active',
      requestKey,
      serialNumber: stored.serialNumber,
      activatedAt: stored.activatedAt,
      cancelKey,
    };
  } catch {
    return { status: 'unlicensed', requestKey, cancelKey };
  }
}
