// support-tools/generate-activation.js
import { readFileSync, appendFileSync } from 'node:fs';
import { createPrivateKey, sign } from 'node:crypto';
import { PRIVATE_KEY_PATH, LICENSES_PATH } from './config.js';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function toBase32(bytes) {
  let bits = 0, value = 0, output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_CHARS[(value << (5 - bits)) & 0x1f];
  return output.match(/.{1,8}/g).join('-');
}

const REQUEST_KEY_RE = /^[A-Z2-7]{6}-[A-Z2-7]{6}-[A-Z2-7]{6}-[A-Z2-7]{6}$/;

const [,, requestKey, serialNumber] = process.argv;

if (!requestKey || !serialNumber) {
  console.error('Usage: node generate-activation.js <requestKey> <serialNumber>');
  process.exit(1);
}

if (!REQUEST_KEY_RE.test(requestKey)) {
  console.error('Error: requestKey format invalid. Expected XXXXXX-XXXXXX-XXXXXX-XXXXXX (Base32 chars)');
  process.exit(1);
}

const privateKeyPem = readFileSync(PRIVATE_KEY_PATH, 'utf8');
const privateKey = createPrivateKey(privateKeyPem);

const message = Buffer.from(requestKey, 'utf8');
const signature = sign(null, message, privateKey);

const payload = Buffer.concat([Buffer.from([0x01]), signature]);
const activationCode = toBase32(payload);

const today = new Date().toISOString().slice(0, 10);
const logLine = `${serialNumber} | ${requestKey} | active | ${today} |\n`;
appendFileSync(LICENSES_PATH, logLine, 'utf8');

console.log('\nActivation Code:');
console.log(activationCode);
console.log(`\nLogged to licenses.txt: ${serialNumber} activated on ${today}`);
