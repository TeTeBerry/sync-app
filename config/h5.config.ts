import path from 'node:path';

const contractPackagesPath = path.resolve(__dirname, '../node_modules/@sync');

/**
 * Optional H5 dev/build profile — not a release target (see sync-app/README.md).
 * Used only by `npm run dev:h5` / `npm run build:h5`.
 */
export const h5Config = {
  compile: {
    include: [contractPackagesPath],
  },
  outputRoot: 'dist-h5',
  publicPath: '/',
  staticDirectory: 'static',
  miniCssExtractPluginOption: {
    ignoreOrder: true,
  },
  router: {
    mode: 'browser' as const,
  },
  postcss: {
    pxtransform: {
      enable: true,
      config: {
        onePxTransform: true,
        unitPrecision: 5,
        propList: ['*'],
        selectorBlackList: [],
        replace: true,
        mediaQuery: false,
        minPixelValue: 0,
        baseFontSize: 20,
      },
    },
    autoprefixer: {
      enable: true,
    },
  },
  webpackChain(chain: {
    performance: {
      maxEntrypointSize: (n: number) => void;
      maxAssetSize: (n: number) => void;
    };
    optimization: { splitChunks: (opts: object) => void };
    resolve: { fallback: Record<string, string | false> };
    plugin: (name: string) => { use: (plugin: unknown, args?: unknown[]) => void };
  }) {
    chain.performance.maxEntrypointSize(5 * 1024 * 1024);
    chain.performance.maxAssetSize(5 * 1024 * 1024);

    // Webpack 5 no longer polyfills Node.js core modules in browser.
    // Any require('crypto') / require('path') in dependencies must be stubbed.
    chain.resolve.fallback = {
      ...(chain.resolve.fallback as Record<string, string | false> | undefined),
      crypto: false,
      fs: false,
      net: false,
      tls: false,
      path: false,
      stream: false,
      os: false,
      http: false,
      https: false,
      zlib: false,
    };

    chain.optimization.splitChunks({
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20_000,
      cacheGroups: {
        taro: {
          name: 'taro-vendor',
          test: /[\\/]node_modules[\\/]@tarojs[\\/]/,
          priority: 20,
        },
        react: {
          name: 'react-vendor',
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          priority: 20,
        },
        zustand: {
          name: 'zustand-vendor',
          test: /[\\/]node_modules[\\/]zustand[\\/]/,
          priority: 15,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    });
  },
  devServer: {
    historyApiFallback: true,
    client: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
};
