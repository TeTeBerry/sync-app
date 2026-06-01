/**
 * @param {import('miniprogram-automator/out/Page').default | undefined} page
 * @param {string} context
 * @returns {import('miniprogram-automator/out/Page').default}
 */
function requirePage(page, context) {
  if (!page) {
    throw new Error(`[e2e] Expected page for ${context} (automator returned undefined)`);
  }
  return page;
}

/** Normalize WeChat page.path (may omit leading slash). */
function normalizeRoutePath(path) {
  return String(path || '').replace(/^\//, '');
}

/**
 * @param {import('miniprogram-automator/out/Page').default} page
 * @param {string} expected
 */
function expectRoutePath(page, expected) {
  expect(normalizeRoutePath(page.path)).toBe(normalizeRoutePath(expected));
}

/**
 * @param {import('miniprogram-automator/out/Page').default} page
 * @param {string} fragment
 */
function expectRouteContains(page, fragment) {
  expect(normalizeRoutePath(page.path)).toContain(fragment);
}

module.exports = { requirePage, normalizeRoutePath, expectRoutePath, expectRouteContains };
