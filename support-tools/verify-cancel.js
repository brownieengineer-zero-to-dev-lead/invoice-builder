// support-tools/verify-cancel.js
import { readFileSync, writeFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { CANCEL_SECRET, LICENSES_PATH } from './config.js';

const REQUEST_KEY_RE = /^[A-Z2-7]{6}-[A-Z2-7]{6}-[A-Z2-7]{6}-[A-Z2-7]{6}$/;
const CANCEL_KEY_RE = /^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/;

const [,, requestKey, cancelKey] = process.argv;

if (!requestKey || !cancelKey) {
  console.error('Usage: node verify-cancel.js <requestKey> <cancelKey>');
  process.exit(1);
}

if (!REQUEST_KEY_RE.test(requestKey)) {
  console.error('Error: requestKey format invalid. Expected XXXXXX-XXXXXX-XXXXXX-XXXXXX (Base32 chars)');
  process.exit(1);
}

if (!CANCEL_KEY_RE.test(cancelKey)) {
  console.error('Error: cancelKey format invalid. Expected XXXX-XXXX-XXXX-XXXX (hex uppercase)');
  process.exit(1);
}

const rawHex = createHmac('sha256', CANCEL_SECRET)
  .update(requestKey)
  .digest()
  .subarray(0, 8)
  .toString('hex')
  .toUpperCase();

const expected = rawHex.match(/.{1,4}/g).join('-');

if (cancelKey !== expected) {
  console.error('Cancel Key ไม่ตรง — ไม่สามารถถอนสิทธิ์ได้');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
let content = readFileSync(LICENSES_PATH, 'utf8');

const lines = content.split('\n');
let found = false;

const updated = lines.map(line => {
  if (line.includes(requestKey) && !line.startsWith('#')) {
    found = true;
    const parts = line.split('|').map(p => p.trim());
    parts[2] = 'canceled';
    parts[4] = today;
    return parts.join(' | ');
  }
  return line;
});

if (!found) {
  console.error(`Error: No license record found for requestKey: ${requestKey}`);
  process.exit(1);
}

writeFileSync(LICENSES_PATH, updated.join('\n'), 'utf8');
console.log(`Success: License for ${requestKey} has been canceled on ${today}`);
