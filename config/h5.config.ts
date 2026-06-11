import path from 'node:path';

const backendSharedPath = path.resolve(__dirname, '../../sync-app-backend/src/shared');

/**
 * Optional H5 dev/build profile — not a release target (see sync-app/README.md).
 * Used only by `npm run dev:h5` / `npm run build:h5`.
 */
export const h5Config = {
  compile: {
    include: [backendSharedPath],
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
  }) {
    chain.performance.maxEntrypointSize(5 * 1024 * 1024);
    chain.performance.maxAssetSize(5 * 1024 * 1024);
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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
};
