#!/usr/bin/env node
/**
 * Record built PLUR H5 to MP4 (Playwright video → ffmpeg).
 * Usage: npm run export:mp4
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const EXPORT_DIR = join(ROOT, 'export');
const TMP_VIDEO_DIR = join(EXPORT_DIR, '.video-tmp');

const WIDTH = 1080;
const HEIGHT = Math.round((WIDTH * 844) / 390);
const DURATION_MS = 12_500;
const MP4_PATH = join(EXPORT_DIR, 'plur-film.mp4');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.map': 'application/json',
};

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function ensureDist() {
  try {
    await stat(join(DIST, 'index.html'));
  } catch {
    throw new Error('dist/ missing — run `npm run build` first');
  }
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] || '/');
        const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
        const filePath = join(DIST, rel);
        const body = await readFile(filePath);
        const type = MIME[extname(filePath)] ?? 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function getServerPort(server) {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind static server');
  }
  return address.port;
}

async function recordWebm(port) {
  await rm(TMP_VIDEO_DIR, { recursive: true, force: true });
  await mkdir(TMP_VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: TMP_VIDEO_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  });

  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html?export=1`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(300);
  await page.waitForTimeout(DURATION_MS);
  await context.close();
  await browser.close();

  const files = await readdir(TMP_VIDEO_DIR);
  const webm = files.find((name) => name.endsWith('.webm'));
  if (!webm) {
    throw new Error('Playwright did not produce a .webm recording');
  }
  return join(TMP_VIDEO_DIR, webm);
}

async function convertToMp4(webmPath) {
  await mkdir(EXPORT_DIR, { recursive: true });
  await run('ffmpeg', [
    '-y',
    '-i',
    webmPath,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-crf',
    '20',
    '-preset',
    'medium',
    MP4_PATH,
  ]);
}

async function main() {
  await ensureDist();
  const server = await startStaticServer();
  const port = getServerPort(server);

  try {
    console.info(`[export:mp4] recording ${WIDTH}x${HEIGHT} for ${DURATION_MS}ms…`);
    const webmPath = await recordWebm(port);
    console.info('[export:mp4] converting to H.264 MP4…');
    await convertToMp4(webmPath);
    console.info(`[export:mp4] done → ${MP4_PATH}`);
  } finally {
    server.close();
    await rm(TMP_VIDEO_DIR, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('[export:mp4] failed:', err);
  process.exit(1);
});
