/**
 * @param {import('miniprogram-automator/out/Page').default} page
 * @param {number} ms
 */
async function waitMs(page, ms) {
  await page.waitFor(ms);
}

/**
 * Poll until selector exists or timeout.
 * @param {import('miniprogram-automator/out/Page').default} page
 * @param {string} selector
 * @param {{ timeoutMs?: number, intervalMs?: number }} [opts]
 */
async function waitForSelector(page, selector, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const intervalMs = opts.intervalMs ?? 300;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const el = await page.$(selector);
    if (el) {
      return el;
    }
    await page.waitFor(intervalMs);
  }
  return null;
}

module.exports = { waitMs, waitForSelector };
