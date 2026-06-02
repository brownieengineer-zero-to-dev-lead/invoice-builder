// support-tools/config.js
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CANCEL_SECRET = 'c7b8781afdc8033045fd93c68f05d539c50c7c2cf354424d2082abe702f00c56';
export const PRIVATE_KEY_PATH = join(__dirname, 'keys', 'private_key.pem');
export const LICENSES_PATH = join(__dirname, 'licenses.txt');
