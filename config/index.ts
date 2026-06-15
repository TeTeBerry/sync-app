import path from 'node:path';
import { defineConfig } from '@tarojs/cli';
import { h5Config } from './h5.config';

const chatContractsPath = path.resolve(
  __dirname,
  '../../sync-app-backend/src/shared/chat/index.ts',
);
const travelPlanContractsPath = path.resolve(
  __dirname,
  '../../sync-app-backend/src/shared/travel-plan/index.ts',
);
const itineraryContractsPath = path.resolve(
  __dirname,
  '../../sync-app-backend/src/shared/itinerary/index.ts',
);
const srcPath = path.resolve(__dirname, '../src');
/** @sync/*-contracts aliases point here; must be babel-included for weapp/h5. */
const backendSharedPath = path.resolve(__dirname, '../../sync-app-backend/src/shared');

/**
 * Primary target: WeChat mini program (weapp). Design draft: 375px logical width.
 * H5 is not actively maintained — use `npm run build:weapp` for release checks.
 */
const plugins: (string | [string, Record<string, unknown>])[] = [
  '@tarojs/plugin-framework-react',
];
if (process.env.TARO_ENV === 'weapp') {
  plugins.push(['@tarojs/plugin-html', {}]);
  plugins.push(path.resolve(__dirname, 'plugins/weapp-swipe-row-void.js'));
}

// https://docs.taro.zone/docs/config-detail
export default defineConfig({
  alias: {
    '@sync/chat-contracts': chatContractsPath,
    '@sync/travel-plan-contracts': travelPlanContractsPath,
    '@sync/itinerary-contracts': itineraryContractsPath,
    /** After @sync/* — bare `@` must not shadow `@sync/…` contract aliases. */
    '@': srcPath,
  },
  projectName: 'sync-app',
  date: '2026-5-24',
  /** Figma / mockup width; SCSS px values match this draft (postcss → rpx on weapp). */
  designWidth: 375,
  deviceRatio: {
    375: 2,
    390: 390 / 375,
    393: 393 / 375,
    414: 414 / 375,
    428: 428 / 375,
    768: 768 / 375,
    820: 820 / 375,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins,
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
    },
  },
  framework: 'react',
  mini: {
    compile: {
      include: [backendSharedPath],
    },
    // @ts-expect-error outputRoot is valid in Taro weapp build
    outputRoot: 'dist-weapp',
    /** 多页面共用组件时 SCSS 导入顺序不一致，忽略 css 合并顺序警告 */
    miniCssExtractPluginOption: {
      ignoreOrder: true,
    },
    /** Native hybrid .wxss still uses @import; silence Dart Sass 3 deprecation noise. */
    sassLoaderOption: {
      sassOptions: {
        silenceDeprecations: ['import'],
      },
    },
    /** Taro weapp already emits common + per-page chunks; keep vendor sideEffects for tree-shake. */
    webpackChain(chain) {
      chain.optimization.usedExports(true);
      chain.optimization.sideEffects(true);
      // Weapp emits per-page + subpackage chunks; async splitChunks hints are noisy in dev.
      chain.performance.hints(false);
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          designWidth: 375,
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
    },
  },
  /** Optional local debug — see config/h5.config.ts (not a release target). */
  h5: h5Config,
});
