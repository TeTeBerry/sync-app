import path from 'node:path';
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@sync/chat-contracts': path.resolve(
        __dirname,
        '../sync-app-backend/src/shared/chat/index.ts',
      ),
      '@sync/travel-plan-contracts': path.resolve(
        __dirname,
        '../sync-app-backend/src/shared/travel-plan/index.ts',
      ),
      '@sync/itinerary-contracts': path.resolve(
        __dirname,
        '../sync-app-backend/src/shared/itinerary/index.ts',
      ),
      '@sync/festival-plan-contracts': path.resolve(
        __dirname,
        '../sync-app-backend/src/shared/festival-plan/index.ts',
      ),
    },
  },
  define: Object.fromEntries(
    Object.entries(taroCompileFlags).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]),
  ),
  test: {
    include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
