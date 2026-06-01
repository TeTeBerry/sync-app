const { isE2eEnabled } = require('./env.cjs');

/** Jest describe that runs only when RUN_E2E=1 or CI_E2E=1. */
const describeE2e = isE2eEnabled() ? describe : describe.skip;

module.exports = { describeE2e };
