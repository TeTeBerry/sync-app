#!/usr/bin/env node
/**
 * Report WeChat mini program bundle sizes from dist-weapp (excludes *.map).
 * Usage: npm run build:weapp && npm run size:weapp
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist-weapp');

const THRESHOLDS = {
  mainPackage: 1_100_000,
  packageEvent: 2_000_000,
  packageAi: 2_000_000,
  packageProfile: 2_000_000,
  totalNoMaps: 4_500_000,
};

const MAIN_ROOT_FILES = [
  'app.js',
  'common.js',
  'taro.js',
  'vendors.js',
  'runtime.js',
  'common.wxss',
  'app-origin.wxss',
  'base.wxml',
  'utils.wxs',
];

const MAIN_DIRS = ['pages', 'custom-tab-bar', 'assets'];

function dirSize(dirPath, { excludeMaps = true } = {}) {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  const walk = (current) => {
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
        continue;
      }
      if (excludeMaps && name.endsWith('.map')) continue;
      total += stat.size;
    }
  };
  walk(dirPath);
  return total;
}

function fileSize(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function fail(message) {
  console.error(`\n[size:weapp] ${message}`);
  process.exit(1);
}

if (!fs.existsSync(DIST)) {
  fail(`Missing ${path.relative(ROOT, DIST)} — run: npm run build:weapp`);
}

let main = 0;
for (const name of MAIN_ROOT_FILES) {
  main += fileSize(path.join(DIST, name));
}
for (const name of MAIN_DIRS) {
  main += dirSize(path.join(DIST, name));
}

const subpackages = {
  packageEvent: dirSize(path.join(DIST, 'packageEvent')),
  packageAi: dirSize(path.join(DIST, 'packageAi')),
  packageProfile: dirSize(path.join(DIST, 'packageProfile')),
};

const mapsTotal =
  dirSize(DIST, { excludeMaps: false }) - dirSize(DIST, { excludeMaps: true });
const totalNoMaps =
  main +
  Object.values(subpackages).reduce((a, b) => a + b, 0) +
  dirSize(path.join(DIST, 'prebundle')) +
  dirSize(path.join(DIST, 'comp'));

const assetsMain = dirSize(path.join(DIST, 'assets'));
const assetsEvent = dirSize(path.join(DIST, 'packageEvent', 'assets'));

const rows = [
  ['主包 (main)', main, THRESHOLDS.mainPackage],
  ['分包 packageEvent', subpackages.packageEvent, THRESHOLDS.packageEvent],
  ['分包 packageAi', subpackages.packageAi, THRESHOLDS.packageAi],
  ['分包 packageProfile', subpackages.packageProfile, THRESHOLDS.packageProfile],
  ['合计 (不含 .map)', totalNoMaps, THRESHOLDS.totalNoMaps],
];

console.log('\nWeChat 小程序包体 (dist-weapp, 不含 .map)\n');
console.log('路径'.padEnd(28) + '大小'.padStart(12) + '阈值'.padStart(12) + '  状态');
console.log('-'.repeat(58));

let exitCode = 0;
for (const [label, bytes, limit] of rows) {
  const ok = bytes <= limit;
  if (!ok) exitCode = 1;
  const status = ok ? 'OK' : 'OVER';
  console.log(
    label.padEnd(28) +
      formatKb(bytes).padStart(12) +
      formatKb(limit).padStart(12) +
      `  ${status}`,
  );
}

console.log('\n静态资源:');
console.log(`  主包 assets/     ${formatKb(assetsMain)}`);
console.log(`  event 分包 assets/ ${formatKb(assetsEvent)}`);
console.log(`  *.map (上传应忽略) ${formatKb(mapsTotal)}`);

if (assetsMain > 50_000) {
  console.warn('\n[size:weapp] warn: 主包 assets/ 仍较大，检查是否有图片打进主包。');
}

if (exitCode !== 0) {
  fail('一项或多项超过阈值，见 docs/BUNDLE-SIZE.md');
}

console.log('\n[size:weapp] 全部在阈值内。\n');
