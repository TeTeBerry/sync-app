import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from '@tarojs/cli';
import { h5Config } from './h5.config';

const require = createRequire(import.meta.url);

function resolveContractEntry(name: string): string {
  return require.resolve(name);
}

const activityContractsPath = resolveContractEntry('@sync/activity-contracts');
const travelPlanContractsPath = resolveContractEntry('@sync/travel-plan-contracts');
const profileContractsPath = resolveContractEntry('@sync/profile-contracts');
const travelGuideContractsPath = resolveContractEntry('@sync/travel-guide-contracts');
const notificationContractsPath = resolveContractEntry('@sync/notification-contracts');
const partnerContractsPath = resolveContractEntry('@sync/partner-contracts');
const itineraryContractsPath = resolveContractEntry('@sync/itinerary-contracts');
const festivalPlanContractsPath = resolveContractEntry('@sync/festival-plan-contracts');
const sceneContractsPath = path.resolve(
  __dirname,
  '../node_modules/@sync/scene-contracts/index.ts',
);
const srcPath = path.resolve(__dirname, '../src');
/** Workspace @sync/*-contracts packages; must be babel-included for weapp/h5. */
const contractPackagesPath = path.resolve(__dirname, '../node_modules/@sync');

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
    '@sync/activity-contracts': activityContractsPath,
    '@sync/travel-plan-contracts': travelPlanContractsPath,
    '@sync/profile-contracts': profileContractsPath,
    '@sync/travel-guide-contracts': travelGuideContractsPath,
    '@sync/notification-contracts': notificationContractsPath,
    '@sync/partner-contracts': partnerContractsPath,
    '@sync/itinerary-contracts': itineraryContractsPath,
    '@sync/festival-plan-contracts': festivalPlanContractsPath,
    '@sync/scene-contracts': sceneContractsPath,
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
      include: [contractPackagesPath],
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
