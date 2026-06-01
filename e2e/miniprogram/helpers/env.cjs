const fs = require('fs');
const path = require('path');

/** sync-app repo root (contains project.config.json). */
const SYNC_APP_ROOT = path.resolve(__dirname, '../../..');

function getProjectPath() {
  return process.env.E2E_PROJECT_PATH || SYNC_APP_ROOT;
}

function getCliPath() {
  if (process.env.WECHAT_CLI_PATH) {
    return process.env.WECHAT_CLI_PATH;
  }
  if (process.platform === 'darwin') {
    const macCli =
      '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
    if (fs.existsSync(macCli)) {
      return macCli;
    }
  }
  if (process.platform === 'win32') {
    const winCli = path.join(
      process.env.LOCALAPPDATA || '',
      '微信开发者工具',
      'cli.bat',
    );
    if (winCli && fs.existsSync(winCli)) {
      return winCli;
    }
  }
  return undefined;
}

/** Set RUN_E2E=1 (or CI_E2E=1) to execute automator specs; otherwise they are skipped. */
function isE2eEnabled() {
  return process.env.RUN_E2E === '1' || process.env.CI_E2E === '1';
}

function getDefaultActivityLegacyId() {
  return process.env.E2E_ACTIVITY_ID || '4';
}

module.exports = {
  SYNC_APP_ROOT,
  getProjectPath,
  getCliPath,
  isE2eEnabled,
  getDefaultActivityLegacyId,
};
