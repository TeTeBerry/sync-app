#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const distIndex = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist',
  'index.html',
);
let html = readFileSync(distIndex, 'utf8');
html = html.replace(
  /<script type="module" crossorigin src="(\.\/assets\/[^"]+\.js)"><\/script>/,
  '<script defer src="$1"></script>',
);
writeFileSync(distIndex, html);
