import { execSync } from 'node:child_process';
import { hostname } from 'node:os';

export function getHardwareId(): string {
  try {
    if (process.platform === 'darwin') {
      const output = execSync('system_profiler SPHardwareDataType', { encoding: 'utf8' });
      const match = output.match(/Serial Number[^:]*:\s*(\S+)/i);
      if (match?.[1]) return match[1];
    } else if (process.platform === 'win32') {
      const output = execSync('wmic csproduct get uuid', { encoding: 'utf8' });
      const lines = output.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines[1]) return lines[1];
    }
  } catch {
    // fall through to fallback
  }
  return `${process.platform}-${hostname()}`;
}
