#!/usr/bin/env node
/**
 * Run official wxa-skills-validate static + build checks.
 *
 * Taro 产物在 dist-weapp/，但微信 CLI preview 需从仓库根目录编译
 * （project.config.json 的 miniprogramRoot: dist-weapp/）。
 * 静态校验读 packageAgentSkills/ 源码；编译校验走 dist-weapp 构建产物。
 *
 * @see https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-validate
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distPath = path.join(root, 'dist-weapp');
const appJsonLink = path.join(root, 'app.json');
const toolsRoot = path.join(root, 'tools', 'ai-mode-skills');
const validateDir = path.join(toolsRoot, 'wxa-skills-validate');
const validateScript = path.join(validateDir, 'scripts', 'validate.mjs');

const defaultCli =
  process.platform === 'darwin'
    ? '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
    : process.platform === 'win32'
      ? 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat'
      : '';

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

if (!fs.existsSync(path.join(distPath, 'app.json'))) {
  fail('dist-weapp/app.json 不存在。请先执行：npm run build:weapp:ai');
}

function ensureValidateTool() {
  if (fs.existsSync(validateScript)) {
    return;
  }

  fs.mkdirSync(path.dirname(toolsRoot), { recursive: true });
  console.log('正在拉取官方 wxa-skills-validate（浅克隆）…');

  if (fs.existsSync(toolsRoot)) {
    fs.rmSync(toolsRoot, { recursive: true, force: true });
  }

  spawnSync(
    'git',
    [
      'clone',
      '--depth',
      '1',
      'https://github.com/wechat-miniprogram/ai-mode-skills.git',
      toolsRoot,
    ],
    { stdio: 'inherit' },
  );

  if (!fs.existsSync(validateScript)) {
    fail(`未找到 ${validateScript}`);
  }
}

ensureValidateTool();

/** validate.mjs 要求 projectRoot 下有 app.json；Taro 只在 dist-weapp 生成。 */
let createdAppJsonLink = false;
if (!fs.existsSync(appJsonLink)) {
  fs.symlinkSync(path.join('dist-weapp', 'app.json'), appJsonLink);
  createdAppJsonLink = true;
  console.log(
    '[validate] 已临时链接 app.json -> dist-weapp/app.json（供校验读取 agent 配置）',
  );
}

const cliPath = process.env.WECHAT_DEVTOOLS_CLI || process.env.WXA_CLI || defaultCli;

const args = [validateScript, root];
if (cliPath && fs.existsSync(cliPath)) {
  args.push('--cli-path', cliPath);
} else {
  console.warn(
    '未找到微信开发者工具 CLI，将仅执行静态校验（跳过 compile preview）。\n' +
      '请安装 Nightly 并设置 WECHAT_DEVTOOLS_CLI 指向 cli 可执行文件。',
  );
}

let exitCode = 1;
try {
  const result = spawnSync('node', args, {
    stdio: 'inherit',
    cwd: validateDir,
  });
  exitCode = result.status ?? 1;

  const reportPath = path.join(root, 'cli-agent-run', 'validate-report.json');
  if (fs.existsSync(reportPath)) {
    console.log(`\n校验报告：${reportPath}`);
  }
} finally {
  if (createdAppJsonLink && fs.existsSync(appJsonLink)) {
    fs.unlinkSync(appJsonLink);
  }
}

process.exit(exitCode);
