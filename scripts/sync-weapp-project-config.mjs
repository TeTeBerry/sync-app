#!/usr/bin/env node
/**
 * Write dist-weapp/project.config.json so WeChat DevTools can open either:
 * - sync-app/ (recommended; root project.config uses miniprogramRoot: dist-weapp/)
 * - dist-weapp/ directly after compile (miniprogramRoot: ./)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcConfigPath = path.join(root, 'project.config.json');
const privateConfigPath = path.join(root, 'project.private.config.json');
const distDir = path.join(root, 'dist-weapp');
const destConfigPath = path.join(distDir, 'project.config.json');

if (!fs.existsSync(srcConfigPath)) {
  console.error('[sync-weapp-project-config] missing project.config.json');
  process.exit(1);
}

fs.mkdirSync(distDir, { recursive: true });

const base = JSON.parse(fs.readFileSync(srcConfigPath, 'utf8'));
const distConfig = {
  ...base,
  miniprogramRoot: './',
};

if (fs.existsSync(privateConfigPath)) {
  try {
    const priv = JSON.parse(fs.readFileSync(privateConfigPath, 'utf8'));
    if (priv.appid) {
      distConfig.appid = priv.appid;
    }
    if (priv.setting) {
      distConfig.setting = { ...distConfig.setting, ...priv.setting };
    }
  } catch {
    // ignore invalid private config
  }
}

const resolvedAppId =
  process.env.TARO_APP_ID ||
  (fs.existsSync(privateConfigPath)
    ? JSON.parse(fs.readFileSync(privateConfigPath, 'utf8')).appid
    : null) ||
  base.appid;

if (resolvedAppId && resolvedAppId !== 'touristappid') {
  distConfig.appid = resolvedAppId;
  if (base.appid !== resolvedAppId) {
    fs.writeFileSync(
      srcConfigPath,
      `${JSON.stringify({ ...base, appid: resolvedAppId }, null, 2)}\n`,
      'utf8',
    );
  }
}

fs.writeFileSync(destConfigPath, `${JSON.stringify(distConfig, null, 2)}\n`, 'utf8');
// eslint-disable-next-line no-console
console.log(
  `[sync-weapp-project-config] wrote ${path.relative(root, destConfigPath)} (miniprogramRoot: ./)`,
);
