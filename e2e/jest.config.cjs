/** Jest config for WeChat miniprogram automator (not Vitest). */
const path = require('path');

module.exports = {
  rootDir: __dirname,
  testMatch: ['<rootDir>/miniprogram/**/*.spec.cjs'],
  testTimeout: 180_000,
  maxWorkers: 1,
  verbose: true,
  watchman: false,
  forceExit: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: [path.join(__dirname, 'miniprogram/helpers/setup.cjs')],
};
