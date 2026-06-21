#!/usr/bin/env node
/**
 * Bundle hygiene checks (no build required).
 * - Lucide: only src/components/icons may import lucide-react-taro
 * - Main package pages must not import heavy packageEvent page modules
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const LUCIDE_ROOT_PATTERN = /from\s+['"]lucide-react-taro['"]/;
const LUCIDE_ICON_PATH_PATTERN = /from\s+['"]lucide-react-taro\/icons\/[^'"]+['"]/;
const ICONS_DIR = path.join(SRC, 'components', 'icons');

const MAIN_PACKAGE_GLOBS = [
  'pages/index',
  'pages/events',
  'pages/profile',
  'app.tsx',
  'components/navigation',
  'components/post',
  'components/event',
  'components/auth',
  'utils/activityMapMarkers.ts',
  'utils/activityMapRoutePlan.ts',
  'utils/tencentMap.ts',
  'utils/tencentMapRoutePlan.ts',
];

/** Path segments that pull heavy event subpackage / canvas into main chunk */
const FORBIDDEN_IN_MAIN = [
  /packageAi\//,
  /packageEvent\//,
  /packageEvent\/pages\/(my-itinerary|exclusive-itinerary)\//,
  /domains\/performance-itinerary\/utils\/itineraryWallpaper/,
  /domains\/performance-itinerary\/utils\/generateItineraryWallpaper/,
];

function walkTsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      walkTsFiles(full, files);
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) {
      files.push(full);
    }
  }
  return files;
}

function rel(file) {
  return path.relative(ROOT, file);
}

function isUnderIcons(file) {
  return file.startsWith(ICONS_DIR + path.sep);
}

function isMainPackageFile(file) {
  const r = rel(file).replace(/\\/g, '/');
  if (r.startsWith('src/components/event/')) {
    return true;
  }
  return MAIN_PACKAGE_GLOBS.some((prefix) => r.startsWith(`src/${prefix}`));
}

const errors = [];

for (const file of walkTsFiles(SRC)) {
  const content = fs.readFileSync(file, 'utf8');

  if (LUCIDE_ROOT_PATTERN.test(content) && !isUnderIcons(file)) {
    errors.push(`${rel(file)}: import lucide-react-taro — use @/components/icons`);
  }

  if (LUCIDE_ICON_PATH_PATTERN.test(content) && !isUnderIcons(file)) {
    errors.push(
      `${rel(file)}: import lucide-react-taro/icons/* — use @/components/icons`,
    );
  }

  if (!isMainPackageFile(file)) {
    continue;
  }

  const code = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  for (const pattern of FORBIDDEN_IN_MAIN) {
    if (pattern.test(code)) {
      errors.push(
        `${rel(file)}: main-package file must not import heavy event submodule (${pattern})`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error('\n[verify:bundle] Failed:\n');
  for (const line of errors) {
    console.error(`  - ${line}`);
  }
  console.error('\nSee docs/BUNDLE-SIZE.md\n');
  process.exit(1);
}

console.log('[verify:bundle] Lucide barrel + main-package import boundaries OK');
