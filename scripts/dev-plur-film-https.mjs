#!/usr/bin/env node
/**
 * Build PLUR H5 and expose it via a public HTTPS URL (cloudflared).
 * WeChat web-view requires HTTPS — paste the printed URL into .env:
 *   TARO_APP_PLUR_FILM_H5_URL=https://xxxx.trycloudflare.com/
 * Then re-run `npm run dev:weapp`.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'h5/plur-film/dist');
const PORT = Number(process.env.PLUR_FILM_HTTPS_PORT || 8787);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.map': 'application/json',
};

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...options });
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

async function ensureBuild() {
  try {
    await stat(join(DIST, 'index.html'));
  } catch {
    console.log('[plur-film:https] building h5/plur-film…');
    await run('npm', ['run', 'build', '--prefix', 'h5/plur-film'], { cwd: ROOT });
  }
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] || '/');
        const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
        const filePath = join(DIST, rel);
        if (!filePath.startsWith(DIST) || !existsSync(filePath)) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const body = await readFile(filePath);
        res.writeHead(200, {
          'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.on('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function startCloudflaredTunnel() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['--yes', 'cloudflared', 'tunnel', '--url', `http://127.0.0.1:${PORT}`],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );

    let settled = false;
    const tryResolve = (text) => {
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (!match || settled) {
        return;
      }
      settled = true;
      resolve({ child, url: `${match[0]}/` });
    };

    child.stdout.on('data', (chunk) => {
      const text = String(chunk);
      process.stdout.write(text);
      tryResolve(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = String(chunk);
      process.stderr.write(text);
      tryResolve(text);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (!settled) {
        reject(new Error(`cloudflared exited with code ${code ?? 'unknown'}`));
      }
    });

    setTimeout(() => {
      if (!settled) {
        reject(new Error('Timed out waiting for cloudflared HTTPS URL'));
      }
    }, 60_000);
  });
}

async function main() {
  await ensureBuild();
  const server = await startStaticServer();
  console.log(`[plur-film:https] local static server → http://127.0.0.1:${PORT}/`);

  const { child, url } = await startCloudflaredTunnel();

  console.log('\n========================================');
  console.log('PLUR H5 HTTPS URL (for WeChat web-view):');
  console.log(url);
  console.log('----------------------------------------');
  console.log('Add to sync-app/.env :');
  console.log(`TARO_APP_PLUR_FILM_H5_URL=${url}`);
  console.log('Then re-run: npm run dev:weapp');
  console.log('========================================\n');

  const shutdown = () => {
    child.kill('SIGTERM');
    server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('[plur-film:https]', error.message);
  process.exit(1);
});
