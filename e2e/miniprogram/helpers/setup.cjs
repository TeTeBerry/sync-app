const { isE2eEnabled } = require('./env.cjs');

jest.setTimeout(180_000);

beforeAll(() => {
  if (!isE2eEnabled()) {
    // eslint-disable-next-line no-console
    console.info(
      '\n[e2e] Skipped: set RUN_E2E=1 to run miniprogram-automator specs.\n' +
        '  Example: RUN_E2E=1 npm run test:e2e\n',
    );
  }
});
