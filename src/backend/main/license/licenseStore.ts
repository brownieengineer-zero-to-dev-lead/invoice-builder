import { randomBytes } from 'node:crypto';
import { LICENSE_SERVICE, LICENSE_SALT_KEY, LICENSE_ACTIVATION_KEY } from './constants';
import type { LicenseState, StoredActivation } from '../../../renderer/shared/types/license';

// Platform-specific secure storage
async function secureGet(key: string): Promise<string | null> {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    const keytar = await import('keytar');
    return keytar.default.getPassword(LICENSE_SERVICE, key);
  } else {
    return new Promise((resolve) => {
      const Registry = require('winreg');
      const reg = new Registry({ hive: Registry.HKCU, key: `\\Software\\InvoiceBuilder` });
      reg.get(key, (_err: unknown, item: { value: string } | null) => {
        resolve(item?.value ?? null);
      });
    });
  }
}

async function secureSet(key: string, value: string): Promise<void> {
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
}

async function secureDelete(key: string): Promise<void> {
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
}

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

export async function readLicenseState(requestKey: string): Promise<LicenseState> {
  const raw = await secureGet(LICENSE_ACTIVATION_KEY);
  if (!raw) return { status: 'unlicensed', requestKey };

  try {
    const stored: StoredActivation = JSON.parse(raw);
    return {
      status: 'active',
      requestKey,
      serialNumber: stored.serialNumber,
      activatedAt: stored.activatedAt
    };
  } catch {
    return { status: 'unlicensed', requestKey };
  }
}
