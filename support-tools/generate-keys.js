#!/usr/bin/env node
/**
 * Generate Ed25519 keypair for Invoice Builder licensing.
 * Run once: node support-tools/generate-keys.js
 *
 * Output:
 *   support-tools/keys/private_key.pem  — keep SECRET, never commit
 *   support-tools/keys/public_key.pem   — embed in app constants.ts
 */

import { generateKeyPairSync } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keysDir = join(__dirname, 'keys');

mkdirSync(keysDir, { recursive: true });

const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' }
});

writeFileSync(join(keysDir, 'private_key.pem'), privateKey);
writeFileSync(join(keysDir, 'public_key.pem'), publicKey);

// Print public key as hex bytes for embedding in constants.ts
const pubKeyObj = (await import('node:crypto')).createPublicKey(publicKey);
const rawPub = pubKeyObj.export({ type: 'spki', format: 'der' }).slice(-32);

console.log('✅ Keys generated:');
console.log('   support-tools/keys/private_key.pem');
console.log('   support-tools/keys/public_key.pem');
console.log('');
console.log('📋 Paste this into src/backend/main/license/constants.ts:');
console.log('');
console.log(`export const EMBEDDED_PUBLIC_KEY_HEX = '${rawPub.toString('hex')}';`);
