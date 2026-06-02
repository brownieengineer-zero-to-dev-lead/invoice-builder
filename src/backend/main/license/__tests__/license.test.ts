import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHardwareId } from '../hardwareId';
import { deriveRequestKey, toBase32, fromBase32, verifyActivationCode, computeCancelKey, encodeActivationCode } from '../licenseVerify';

// ---------------------------------------------------------------------------
// Top-level keytar mock (must be hoisted — cannot be inside it() blocks)
// ---------------------------------------------------------------------------
const keytarStore: Record<string, string> = {};
vi.mock('keytar', () => ({
  default: {
    getPassword: vi.fn((_service: string, key: string) => Promise.resolve(keytarStore[key] ?? null)),
    setPassword: vi.fn((_service: string, key: string, value: string) => { keytarStore[key] = value; return Promise.resolve(); }),
    deletePassword: vi.fn((_service: string, key: string) => { delete keytarStore[key]; return Promise.resolve(true); })
  }
}));

// Pre-signed with test private key (support-tools/keys/private_key.pem)
// Message: 'ABCDEF-GHIJKL-MNOPQR-STUV23'
const FIXTURE_REQUEST_KEY = 'ABCDEF-GHIJKL-MNOPQR-STUV23';
const FIXTURE_VALID_ACTIVATION_CODE = 'AE3E6DHF-ZMYDMIXU-YVY7SV7X-QLPYWCAN-QWDWZGHY-AMYRL2UD-2TBZXSNA-A7EE2CG5-3JSCC22X-KUIOFVOO-X3KBPE5P-5XGXYR5G-N3ZMLHIG';

// ---------------------------------------------------------------------------
// 1. Hardware ID
// ---------------------------------------------------------------------------
describe('getHardwareId', () => {
  it('should return a non-empty string', () => {
    const id = getHardwareId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should return the same value on repeated calls', () => {
    const a = getHardwareId();
    const b = getHardwareId();
    expect(a).toBe(b);
  });
});

// ---------------------------------------------------------------------------
// 2. Request Key derivation
// ---------------------------------------------------------------------------
describe('deriveRequestKey', () => {
  it('should produce a 24-char Base32 string grouped as xxxxxx-xxxxxx-xxxxxx-xxxxxx', () => {
    const key = deriveRequestKey('HARDWARE_ID_ABC', 'a'.repeat(64));
    expect(key).toMatch(/^[A-Z2-7]{6}-[A-Z2-7]{6}-[A-Z2-7]{6}-[A-Z2-7]{6}$/);
  });

  it('should produce different keys for different salts', () => {
    const key1 = deriveRequestKey('HARDWARE_ID_ABC', 'salt1');
    const key2 = deriveRequestKey('HARDWARE_ID_ABC', 'salt2');
    expect(key1).not.toBe(key2);
  });

  it('should produce different keys for different hardwareIds', () => {
    const key1 = deriveRequestKey('HARDWARE_A', 'sameSalt');
    const key2 = deriveRequestKey('HARDWARE_B', 'sameSalt');
    expect(key1).not.toBe(key2);
  });
});

// ---------------------------------------------------------------------------
// 3. Base32 encoding / decoding
// ---------------------------------------------------------------------------
describe('Base32 codec', () => {
  it('encodeActivationCode: should produce 13 groups of 8 chars (65 bytes with version byte)', () => {
    const sig = Buffer.alloc(64, 0xab);
    const encoded = encodeActivationCode(sig);
    const groups = encoded.split('-');
    expect(groups.length).toBe(13);
    groups.forEach(g => expect(g.length).toBe(8));
  });

  it('should produce only uppercase Base32 characters (A-Z, 2-7) and dashes', () => {
    const encoded = encodeActivationCode(Buffer.alloc(64, 0xab));
    expect(encoded).toMatch(/^[A-Z2-7-]+$/);
  });

  it('round-trip: fromBase32(toBase32(bytes)) should equal original bytes', () => {
    const original = Buffer.from(Array.from({ length: 64 }, (_, i) => i));
    const encoded = toBase32(original);
    const decoded = fromBase32(encoded);
    expect(decoded).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// 4. Activation Code verification (Ed25519)
// ---------------------------------------------------------------------------
describe('verifyActivationCode', () => {
  it('should return true for a valid activation code signed with the private key', () => {
    const result = verifyActivationCode(FIXTURE_VALID_ACTIVATION_CODE, FIXTURE_REQUEST_KEY);
    expect(result.success).toBe(true);
  });

  it('should return false for an activation code signed against a different requestKey', () => {
    const result = verifyActivationCode(FIXTURE_VALID_ACTIVATION_CODE, 'ZZZZZZ-ZZZZZZ-ZZZZZZ-ZZZ234');
    expect(result.success).toBe(false);
    expect(result.error).toBe('invalid_signature');
  });

  it('should return false for a tampered activation code (one char changed)', () => {
    const tampered = FIXTURE_VALID_ACTIVATION_CODE.replace('G', 'A');
    const result = verifyActivationCode(tampered, FIXTURE_REQUEST_KEY);
    expect(result.success).toBe(false);
    expect(result.error).toBe('invalid_signature');
  });

  it('should return false for a malformed activation code (wrong group count)', () => {
    const result = verifyActivationCode('TOOSHORT', FIXTURE_REQUEST_KEY);
    expect(result.success).toBe(false);
    expect(result.error).toBe('tampered');
  });

  it('should return false for activation code with invalid Base32 characters', () => {
    // '0' and '1' are not valid Base32 chars
    const invalid = '00000000-11111111-AAAAAAAA-BBBBBBBB-CCCCCCCC-DDDDDDDD-EEEEEEEE-FFFFFFFF-GGGGGGGG-HHHHHHHH-IIIIIIII-JJJJJJJJ-KKKKKKKK';
    const result = verifyActivationCode(invalid, FIXTURE_REQUEST_KEY);
    expect(result.success).toBe(false);
    expect(result.error).toBe('tampered');
  });
});

// ---------------------------------------------------------------------------
// 5. Cancel Key computation
// ---------------------------------------------------------------------------
describe('computeCancelKey', () => {
  it('should return a 19-char uppercase hex string formatted as XXXX-XXXX-XXXX-XXXX', () => {
    const cancelKey = computeCancelKey(FIXTURE_REQUEST_KEY);
    expect(cancelKey).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it('should produce different cancel keys for different request keys', () => {
    const k1 = computeCancelKey(FIXTURE_REQUEST_KEY);
    const k2 = computeCancelKey('ZZZZZZ-ZZZZZZ-ZZZZZZ-ZZZ234');
    expect(k1).not.toBe(k2);
  });

  it('should be deterministic — same requestKey always produces same cancelKey', () => {
    const k1 = computeCancelKey(FIXTURE_REQUEST_KEY);
    const k2 = computeCancelKey(FIXTURE_REQUEST_KEY);
    expect(k1).toBe(k2);
  });
});

// ---------------------------------------------------------------------------
// 6. License Store (mocked OS storage via top-level keytar mock)
// ---------------------------------------------------------------------------
describe('licenseStore', () => {
  beforeEach(() => {
    // Reset the in-memory store before each test
    Object.keys(keytarStore).forEach(k => delete keytarStore[k]);
  });

  it('readOrCreateSalt: should return a hex string of 64 chars (32 bytes) on first call', async () => {
    const { readOrCreateSalt } = await import('../licenseStore');
    const salt = await readOrCreateSalt();
    expect(salt).toMatch(/^[0-9a-f]{64}$/);
  });

  it('readOrCreateSalt: should return the same salt on subsequent calls', async () => {
    const { readOrCreateSalt } = await import('../licenseStore');
    const salt1 = await readOrCreateSalt();
    const salt2 = await readOrCreateSalt();
    expect(salt1).toBe(salt2);
  });

  it('writeLicenseActivation + readLicenseState: should return active status', async () => {
    const { writeLicenseActivation, readLicenseState } = await import('../licenseStore');
    await writeLicenseActivation({ activationCode: 'CODE', serialNumber: 'SN-001', activatedAt: '2026-06-03' });
    const state = await readLicenseState('ABCDEF-GHIJKL-MNOPQR-STUV23');
    expect(state.status).toBe('active');
    expect(state.serialNumber).toBe('SN-001');
  });

  it('clearLicenseActivation: should reset status to unlicensed', async () => {
    const { writeLicenseActivation, clearLicenseActivation, readLicenseState } = await import('../licenseStore');
    await writeLicenseActivation({ activationCode: 'CODE', serialNumber: 'SN-001', activatedAt: '2026-06-03' });
    await clearLicenseActivation();
    const state = await readLicenseState('ABCDEF-GHIJKL-MNOPQR-STUV23');
    expect(state.status).toBe('unlicensed');
  });
});

// ---------------------------------------------------------------------------
// 7. Revoke flow (integration)
// ---------------------------------------------------------------------------
describe('revoke flow', () => {
  beforeEach(() => {
    Object.keys(keytarStore).forEach(k => delete keytarStore[k]);
    // Pre-seed a known salt
    keytarStore['license-salt'] = 'aaaaaaaabbbbbbbbccccccccddddddddaaaaaaaabbbbbbbbccccccccdddddddd';
  });

  it('should rotate salt so the new salt differs from the old', async () => {
    const { rotateSalt } = await import('../licenseStore');
    const oldSalt = keytarStore['license-salt'];
    const newSalt = await rotateSalt();
    expect(newSalt).not.toBe(oldSalt);
    expect(newSalt).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should clear stored activation after revoke', async () => {
    const { writeLicenseActivation, clearLicenseActivation, readLicenseState } = await import('../licenseStore');
    await writeLicenseActivation({ activationCode: 'CODE', serialNumber: 'SN-001', activatedAt: '2026-06-03' });
    await clearLicenseActivation();
    const state = await readLicenseState('ABCDEF-GHIJKL-MNOPQR-STUV23');
    expect(state.status).toBe('unlicensed');
  });

  it('computeCancelKey + deriveRequestKey should both return correct formats after salt rotation', async () => {
    const { rotateSalt } = await import('../licenseStore');
    const cancelKey = computeCancelKey(FIXTURE_REQUEST_KEY);
    const newSalt = await rotateSalt();
    const newRequestKey = deriveRequestKey('HARDWARE_ID_ABC', newSalt);
    expect(cancelKey).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(newRequestKey).toMatch(/^[A-Z2-7]{6}-[A-Z2-7]{6}-[A-Z2-7]{6}-[A-Z2-7]{6}$/);
  });
});
