#!/usr/bin/env node
/**
 * Run official wxa-skills-eval (对话模拟 + 端到端评测).
 *
 * 项目路径为仓库根目录（与 validate 一致，miniprogramRoot: dist-weapp/）。
 * 首次运行会浅克隆 tools/ai-mode-skills/ 并从 .env.example 生成 .env。
 *
 * @see https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-eval
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
const evalDir = path.join(toolsRoot, 'wxa-skills-eval');
const evalCli = path.join(evalDir, 'cli', 'index.js');
const envPath = path.join(evalDir, '.env');
const envExamplePath = path.join(evalDir, '.env.example');
const materializedEnvPath = path.join(root, 'cli-agent-run', 'eval-llm.env');

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

function ensureEvalTool() {
  if (fs.existsSync(evalCli)) {
    return;
  }

  fs.mkdirSync(path.dirname(toolsRoot), { recursive: true });
  console.log('正在拉取官方 ai-mode-skills（浅克隆，含 wxa-skills-eval）…');

  if (fs.existsSync(toolsRoot)) {
    fs.rmSync(toolsRoot, { recursive: true, force: true });
  }

  const result = spawnSync(
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

  if (result.status !== 0 || !fs.existsSync(evalCli)) {
    fail(`未找到 ${evalCli}`);
  }
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const vars = {};
  for (const line of fs.readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const idx = trimmed.indexOf('=');
    if (idx < 1) {
      continue;
    }
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    const commentIdx = value.search(/\s+#/);
    if (commentIdx >= 0) {
      value = value.slice(0, commentIdx).trim();
    }
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function isLlmConfigured(vars) {
  const baseUrl = vars.WXA_SKILL_EVAL_LLM_BASE_URL ?? '';
  const apiKey = vars.WXA_SKILL_EVAL_LLM_API_KEY ?? '';
  const model = vars.WXA_SKILL_EVAL_LLM_MODEL ?? '';
  if (!baseUrl || !model) {
    return false;
  }
  return apiKey.length > 0 && !apiKey.includes('xxxxxxxx');
}

function resolveLlmEnvPath() {
  const rootEnvPath = path.join(root, '.env');
  const candidates = [
    { path: envPath, label: 'wxa-skills-eval/.env' },
    { path: rootEnvPath, label: '仓库根目录 .env' },
  ];

  for (const { path: candidate, label } of candidates) {
    if (isLlmConfigured(parseEnvFile(candidate))) {
      return { path: candidate, label };
    }
  }
  return null;
}

/** wxa-skills-eval 的 .env 解析器不会剥离行内 # 注释，这里生成干净副本。 */
function materializeEvalEnv(sourcePath, options = {}) {
  const merged = {
    ...parseEnvFile(envPath),
    ...parseEnvFile(sourcePath),
  };
  if (options.requireLlm && !isLlmConfigured(merged)) {
    return null;
  }
  const devtoolsDefaults = {
    DEVTOOLS_ENV_CALL_TOOL_TIMEOUT: '60',
    DEVTOOLS_ENV_CHAT_TIMEOUT: '90',
    DEVTOOLS_ENV_LAUNCH_TIMEOUT: '30',
    WXA_SKILL_EVAL_LLM_TIMEOUT: '120',
    DEVTOOLS_ENV_PROJECT_PATH: root,
  };
  if (options.skipAutoLaunch) {
    devtoolsDefaults.DEVTOOLS_ENV_SKIP_AUTO_LAUNCH = '1';
  }
  for (const [key, defaultVal] of Object.entries(devtoolsDefaults)) {
    if (!merged[key]) {
      merged[key] = defaultVal;
    }
  }
  const outLines = [];
  for (const [key, value] of Object.entries(merged)) {
    if (
      key.startsWith('WXA_SKILL_EVAL_') ||
      key.startsWith('DEVTOOLS_') ||
      key === 'DEVTOOLS_CLI_OVERRIDE'
    ) {
      outLines.push(`${key}=${value}`);
    }
  }
  fs.mkdirSync(path.dirname(materializedEnvPath), { recursive: true });
  fs.writeFileSync(materializedEnvPath, `${outLines.join('\n')}\n`, 'utf-8');
  return materializedEnvPath;
}

function ensureEnvFile() {
  if (fs.existsSync(envPath)) {
    return;
  }

  if (!fs.existsSync(envExamplePath)) {
    fail(`未找到 ${envExamplePath}`);
  }

  fs.copyFileSync(envExamplePath, envPath);
  console.log(`[eval] 已从 .env.example 创建 ${envPath}`);
  console.log('[eval] 可在该文件或仓库根目录 .env 中配置 WXA_SKILL_EVAL_LLM_* 三项。');
}

const subcommand = process.argv[2] === 'serve' ? 'serve' : 'run';
const passthrough = process.argv.slice(subcommand === 'serve' ? 3 : 2);
const skipAutoLaunch =
  subcommand === 'serve' ||
  process.env.DEVTOOLS_ENV_SKIP_AUTO_LAUNCH === '1' ||
  parseEnvFile(path.join(root, '.env')).DEVTOOLS_ENV_SKIP_AUTO_LAUNCH === '1';

ensureEvalTool();
ensureEnvFile();

const llmEnv = resolveLlmEnvPath();
if (subcommand === 'run' && !llmEnv) {
  fail(
    `LLM 未配置。请在以下任一文件填入 WXA_SKILL_EVAL_LLM_BASE_URL / API_KEY / MODEL：\n` +
      `  - ${envPath}\n` +
      `  - ${path.join(root, '.env')}`,
  );
}

if (llmEnv && llmEnv.path !== envPath) {
  console.log(`[eval] 使用 ${llmEnv.label} 中的 WXA_SKILL_EVAL_LLM_* 配置`);
}

const evalEnvPath = llmEnv
  ? materializeEvalEnv(llmEnv.path, {
      requireLlm: subcommand === 'run',
      skipAutoLaunch,
    })
  : materializeEvalEnv(envPath, {
      requireLlm: subcommand === 'run',
      skipAutoLaunch,
    });
if (subcommand === 'run' && !evalEnvPath) {
  fail(
    `LLM 未配置。请在以下任一文件填入 WXA_SKILL_EVAL_LLM_BASE_URL / API_KEY / MODEL：\n` +
      `  - ${envPath}\n` +
      `  - ${path.join(root, '.env')}`,
  );
}
if (evalEnvPath) {
  console.log(`[eval] 已生成去注释 env：${evalEnvPath}`);
}
if (skipAutoLaunch) {
  console.log(
    '[eval] DEVTOOLS_ENV_SKIP_AUTO_LAUNCH=1（复用已打开的微信开发者工具，不会自动再起一个）',
  );
  console.log(
    `[eval] 请确认工具已打开项目 ${root}，并已开启「服务端口」与「小程序 AI 编译」`,
  );
}

if (!fs.existsSync(path.join(distPath, 'app.json'))) {
  fail('dist-weapp/app.json 不存在。请先执行：npm run build:weapp:ai');
}

let createdAppJsonLink = false;
if (!fs.existsSync(appJsonLink)) {
  fs.symlinkSync(path.join('dist-weapp', 'app.json'), appJsonLink);
  createdAppJsonLink = true;
  console.log(
    '[eval] 已临时链接 app.json -> dist-weapp/app.json（供评测读取 agent 配置）',
  );
}

const cliPath = process.env.WECHAT_DEVTOOLS_CLI || process.env.WXA_CLI || defaultCli;

const args = [evalCli, subcommand, '-p', root, '--env', evalEnvPath ?? envPath];

if (cliPath && fs.existsSync(cliPath)) {
  const devtoolsApp =
    process.platform === 'darwin'
      ? path.dirname(path.dirname(path.dirname(cliPath)))
      : path.dirname(cliPath);
  args.push('--devtools-app-path', devtoolsApp);
} else {
  console.warn(
    '未找到微信开发者工具 CLI；将尝试 wechatidecli 自动探测。\n' +
      '请安装 Nightly 并开启「服务端口」，或设置 WECHAT_DEVTOOLS_CLI。',
  );
}

if (subcommand === 'run' && !passthrough.some((a) => a === '-c' || a === '--cases')) {
  args.push('--cases', '3');
}

if (
  subcommand === 'run' &&
  !passthrough.some((a) => a === '--skills' || a.startsWith('--skills='))
) {
  args.push(
    '--skills',
    'festival-search,recruit-discovery,recruit-draft,festival-prep',
  );
}

args.push(...passthrough);

let exitCode = 1;
try {
  const result = spawnSync('node', args, {
    stdio: 'inherit',
    cwd: evalDir,
    env: {
      ...process.env,
      DEVTOOLS_ENV_PROJECT_PATH: root,
    },
  });
  exitCode = result.status ?? 1;
} finally {
  if (createdAppJsonLink && fs.existsSync(appJsonLink)) {
    fs.unlinkSync(appJsonLink);
  }
}

process.exit(exitCode);
