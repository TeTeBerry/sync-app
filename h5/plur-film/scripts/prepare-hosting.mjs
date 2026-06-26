#!/usr/bin/env node
/**
 * Bundle dist/ + domain-root verify files for CloudBase static hosting upload.
 * Output: hosting-upload/
 *   MP_verify_*.txt          (domain root — WeChat 业务域名校验)
 *   plur-film/index.html     (H5)
 *   plur-film/assets/...
 */
import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const HOSTING_ROOT = join(ROOT, 'hosting-root');
const OUT = join(ROOT, 'hosting-upload');

async function ensureDist() {
  try {
    await stat(join(DIST, 'index.html'));
  } catch {
    throw new Error('dist/ missing — run `npm run build` first');
  }
}

async function copyHostingRoot(targetRoot) {
  let entries = [];
  try {
    entries = await readdir(HOSTING_ROOT);
  } catch {
    return [];
  }
  const copied = [];
  for (const name of entries) {
    if (name.startsWith('.')) {
      continue;
    }
    const src = join(HOSTING_ROOT, name);
    const dest = join(targetRoot, name);
    await cp(src, dest, { recursive: true });
    copied.push(name);
  }
  return copied;
}

async function main() {
  await ensureDist();
  await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, 'plur-film'), { recursive: true });
  await cp(DIST, join(OUT, 'plur-film'), { recursive: true });
  const rootFiles = await copyHostingRoot(OUT);
  console.info('[prepare:hosting] output → hosting-upload/');
  console.info('[prepare:hosting] plur-film/ ← dist');
  if (rootFiles.length > 0) {
    console.info(`[prepare:hosting] domain root files: ${rootFiles.join(', ')}`);
  } else {
    console.warn(
      '[prepare:hosting] no hosting-root/ files — add MP_verify_xxxx.txt before WeChat 业务域名校验',
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
