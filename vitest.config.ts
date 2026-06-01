import { defineConfig } from 'vitest/config';

/** Mirrors Taro compile-time flags so `@tarojs/*` can load in Vitest. */
const taroCompileFlags = {
  ENABLE_INNER_HTML: true,
  ENABLE_ADJACENT_HTML: true,
  ENABLE_CLONE_NODE: true,
  ENABLE_CONTAINS: true,
  ENABLE_SIZE_APIS: true,
  ENABLE_TEMPLATE_CONTENT: true,
};

export default defineConfig({
  define: Object.fromEntries(
    Object.entries(taroCompileFlags).map(([key, value]) => [key, JSON.stringify(value)]),
  ),
  test: {
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
