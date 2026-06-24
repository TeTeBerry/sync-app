import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

function resolveContractEntry(name: string): string {
  return require.resolve(name);
}

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
      '@sync/activity-contracts': resolveContractEntry('@sync/activity-contracts'),
      '@sync/chat-contracts': resolveContractEntry('@sync/chat-contracts'),
      '@sync/travel-plan-contracts': resolveContractEntry(
        '@sync/travel-plan-contracts',
      ),
      '@sync/profile-contracts': resolveContractEntry('@sync/profile-contracts'),
      '@sync/travel-guide-contracts': resolveContractEntry(
        '@sync/travel-guide-contracts',
      ),
      '@sync/notification-contracts': resolveContractEntry(
        '@sync/notification-contracts',
      ),
      '@sync/partner-contracts': resolveContractEntry('@sync/partner-contracts'),
      '@sync/itinerary-contracts': resolveContractEntry('@sync/itinerary-contracts'),
      '@sync/festival-plan-contracts': resolveContractEntry(
        '@sync/festival-plan-contracts',
      ),
      '@sync/scene-contracts': path.resolve(
        __dirname,
        'node_modules/@sync/scene-contracts/index.ts',
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
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx', 'test/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
