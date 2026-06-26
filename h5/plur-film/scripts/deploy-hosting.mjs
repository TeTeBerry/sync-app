#!/usr/bin/env node
/**
 * Deploy hosting-upload/ to CloudBase static website hosting.
 * Prereq: npx @cloudbase/cli login
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const UPLOAD = join(ROOT, 'hosting-upload');
const ENV_ID =
  process.env.TCB_ENV_ID ??
  JSON.parse(readFileSync(join(ROOT, 'cloudbaserc.json'), 'utf8')).envId;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: false });
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

async function main() {
  console.info(`[deploy:hosting] env=${ENV_ID}`);
  await run('npm', ['run', 'prepare:hosting']);
  await run('npx', ['tcb', 'hosting', 'deploy', UPLOAD, '-e', ENV_ID]);
  console.info('[deploy:hosting] done');
  console.info(
    '[deploy:hosting] next: CloudBase 控制台 → 静态网站托管 → 复制默认/自定义域名',
  );
  console.info(
    '[deploy:hosting] then: 微信公众平台 → 开发设置 → 业务域名 → 下载校验文件 → 放入 hosting-root/ → redeploy',
  );
}

main().catch((err) => {
  console.error('[deploy:hosting] failed:', err.message);
  process.exit(1);
});
