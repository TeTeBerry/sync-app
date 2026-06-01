const automator = require('miniprogram-automator');
const { getProjectPath, getCliPath } = require('./env.cjs');

/**
 * Launch or connect WeChat DevTools automation session for sync-app.
 * @returns {Promise<import('miniprogram-automator/out/MiniProgram').default>}
 */
async function launchMiniProgram() {
  const port = process.env.E2E_AUTO_PORT;
  if (port) {
    return automator.connect({
      wsEndpoint: `ws://127.0.0.1:${port}`,
    });
  }

  const options = {
    projectPath: getProjectPath(),
    timeout: Number(process.env.E2E_LAUNCH_TIMEOUT_MS || 120_000),
  };
  const cliPath = getCliPath();
  if (cliPath) {
    options.cliPath = cliPath;
  }
  return automator.launch(options);
}

module.exports = { launchMiniProgram };
