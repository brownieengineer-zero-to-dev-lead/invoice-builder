import { createHmac, createPublicKey, verify as cryptoVerify } from 'node:crypto';
import { EMBEDDED_PUBLIC_KEY_HEX, CANCEL_SECRET } from './constants';

// Base32 alphabet (RFC 4648): A-Z, 2-7
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function toBase32(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 0x1f];
  }

  // Group into 8-char chunks separated by dashes
  return output.match(/.{1,8}/g)!.join('-');
}

export function fromBase32(encoded: string): Buffer {
  const clean = encoded.replace(/-/g, '').toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of clean) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) throw new Error(`Invalid Base32 character: ${char}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function deriveRequestKey(hardwareId: string, salt: string): string {
  const raw = createHmac('sha256', salt)
    .update(hardwareId)
    .digest();

  // Take first 15 bytes → 24-char Base32 (no padding needed: 15*8/5 = 24)
  const encoded = toBase32(raw.subarray(0, 15)).replace(/-/g, '');
  // Format as xxxxxx-xxxxxx-xxxxxx-xxxxxx
  return encoded.match(/.{6}/g)!.join('-');
}

// Version byte prefix: 0x01 makes 64-byte Ed25519 sig → 65 bytes → 104 Base32 chars (13×8)
const ACTIVATION_VERSION = 0x01;

export function encodeActivationCode(signatureBytes: Buffer): string {
  const payload = Buffer.concat([Buffer.from([ACTIVATION_VERSION]), signatureBytes]);
  return toBase32(payload);
}

export function verifyActivationCode(
  activationCode: string,
  requestKey: string
): { success: boolean; error?: 'invalid_signature' | 'tampered' } {
  // Validate format: 13 groups of 8 Base32 chars, uppercase A-Z2-7 only
  const groups = activationCode.split('-');
  if (groups.length !== 13 || groups.some(g => g.length !== 8)) {
    return { success: false, error: 'tampered' };
  }
  if (!/^[A-Z2-7-]+$/.test(activationCode)) {
    return { success: false, error: 'tampered' };
  }

  let payload: Buffer;
  try {
    payload = fromBase32(activationCode);
  } catch {
    return { success: false, error: 'tampered' };
  }

  // Expect version byte + 64-byte signature = 65 bytes
  if (payload.length !== 65 || payload[0] !== ACTIVATION_VERSION) {
    return { success: false, error: 'tampered' };
  }

  const signatureBytes = payload.subarray(1);

  try {
    const rawPubBytes = Buffer.from(EMBEDDED_PUBLIC_KEY_HEX, 'hex');
    // SPKI prefix for Ed25519: 302a300506032b6570032100
    const spkiDer = Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), rawPubBytes]);
    const publicKey = createPublicKey({ key: spkiDer, format: 'der', type: 'spki' });
    const message = Buffer.from(requestKey, 'utf8');

    const ok = cryptoVerify(null, message, publicKey, signatureBytes);
    return ok ? { success: true } : { success: false, error: 'invalid_signature' };
  } catch {
    return { success: false, error: 'invalid_signature' };
  }
}

export function computeCancelKey(requestKey: string): string {
  const raw = createHmac('sha256', CANCEL_SECRET)
    .update(requestKey)
    .digest()
    .subarray(0, 8);

  const hex = raw.toString('hex').toUpperCase();
  // Format as XXXX-XXXX-XXXX-XXXX (19 chars)
  return hex.match(/.{4}/g)!.join('-');
}
