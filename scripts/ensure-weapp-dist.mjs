#!/usr/bin/env node
/**
 * Ensure dist-weapp exists before miniprogram-automator runs.
 * Usage: node scripts/ensure-weapp-dist.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appJson = path.join(root, 'dist-weapp', 'app.json');

if (!fs.existsSync(appJson)) {
  // eslint-disable-next-line no-console
  console.log('[ensure-weapp-dist] dist-weapp/app.json missing — running build:weapp…');
  execSync('npm run build:weapp', { cwd: root, stdio: 'inherit' });
}

if (!fs.existsSync(appJson)) {
  console.error('[ensure-weapp-dist] build failed: dist-weapp/app.json still missing');
  process.exit(1);
}
