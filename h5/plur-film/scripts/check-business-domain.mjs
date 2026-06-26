#!/usr/bin/env node
/**
 * Verify PLUR H5 URL + WeChat MP_verify file are reachable over HTTPS.
 * Usage: node scripts/check-business-domain.mjs [baseUrl]
 */
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOSTING_ROOT = join(__dirname, '..', 'hosting-root');

async function loadEnvProductionUrl() {
  try {
    const envPath = join(__dirname, '..', '..', '..', '.env.production');
    const text = await import('node:fs/promises').then((fs) =>
      fs.readFile(envPath, 'utf8'),
    );
    const line = text
      .split('\n')
      .find((l) => l.startsWith('TARO_APP_PLUR_FILM_H5_URL='));
    if (!line) {
      return null;
    }
    const value = line.split('=').slice(1).join('=').trim();
    return value || null;
  } catch {
    return null;
  }
}

async function headOk(url) {
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  return { ok: res.ok, status: res.status, url: res.url };
}

async function main() {
  const fromEnv = await loadEnvProductionUrl();
  const base = (process.argv[2] ?? fromEnv ?? '').trim().replace(/\/$/, '');
  if (!base) {
    console.error(
      'Usage: node scripts/check-business-domain.mjs https://your-host/plur-film',
    );
    process.exit(1);
  }

  const host = new URL(base.includes('://') ? base : `https://${base}`).origin;
  console.info(`[check] host=${host}`);

  const indexUrl = `${base}/index.html`;
  const index = await headOk(indexUrl);
  console.info(`[check] H5 ${index.ok ? 'OK' : 'FAIL'} ${index.status} ${indexUrl}`);

  let verifyFiles = [];
  try {
    verifyFiles = (await readdir(HOSTING_ROOT)).filter((n) =>
      n.startsWith('MP_verify_'),
    );
  } catch {
    verifyFiles = [];
  }

  if (verifyFiles.length === 0) {
    console.warn(
      '[check] no MP_verify_*.txt in hosting-root/ — download from 微信公众平台 → 业务域名',
    );
  } else {
    for (const file of verifyFiles) {
      const url = `${host}/${file}`;
      const result = await headOk(url);
      console.info(
        `[check] verify ${result.ok ? 'OK' : 'FAIL'} ${result.status} ${url}`,
      );
    }
  }

  if (!index.ok) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[check] failed:', err);
  process.exit(1);
});
