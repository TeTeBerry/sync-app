import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, '../..');
  const env = loadEnv(mode, envDir, ['VITE_', 'TARO_APP_']);
  const apiBase = (env.VITE_API_BASE_URL || env.TARO_APP_API_BASE_URL || '').replace(
    /\/$/,
    '',
  );

  return {
    base: './',
    define: {
      __PLUR_FILM_API_BASE_URL__: JSON.stringify(apiBase),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      // WeChat web-view is more reliable with a single IIFE bundle (no type="module").
      target: 'es2015',
      modulePreload: false,
      rollupOptions: {
        output: {
          format: 'iife',
          inlineDynamicImports: true,
          entryFileNames: 'assets/plur-film.js',
        },
      },
    },
    server: {
      host: true,
      port: 5174,
    },
  };
});
