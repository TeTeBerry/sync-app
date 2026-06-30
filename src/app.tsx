import './utils/abortControllerPolyfill';
import { hydrateAppCachesFromStorage } from './utils/homeCacheStorage';
import { hydrateActivityPerformanceBundlesFromStorage } from './utils/activityPerformanceBundleStorage';

hydrateAppCachesFromStorage();
hydrateActivityPerformanceBundlesFromStorage();

import './app.scss';
import { useLaunch } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { API_BASE_URL, isLiveApi } from './constants/api';
import { ensureAuth } from './utils/auth';
import { View } from '@tarojs/components';
import { LucideTaroProvider } from './components/icons';
import type { PropsWithChildren } from 'react';
import NavigationLoadingOverlay from './components/navigation/NavigationLoadingOverlay';
import ThemedLoadingModal from './components/ThemedLoadingModal';
import { preloadEventSubpackage } from './utils/subpackagePreload';
import { initCloudBase } from './utils/cloudInit';
import {
  prefetchCoreQueriesOnLaunch,
  prefetchProfileIfMissing,
} from './utils/appLaunchPrefetch';
import { useLocaleStore } from './i18n/localeStore';
import { t } from './i18n';

export default function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    const app = Taro.getApp<{ globalData?: { apiBase?: string } }>();
    if (app) {
      app.globalData = app.globalData ?? {};
      app.globalData.apiBase = API_BASE_URL;
    }
    Taro.setStorageSync('sync_api_base', API_BASE_URL);
    useLocaleStore.getState().hydrate();
    initCloudBase();
    if (isLiveApi()) {
      void (async () => {
        try {
          await prefetchCoreQueriesOnLaunch();
        } catch (error) {
          console.warn('[launch] prefetchCoreQueriesOnLaunch failed:', error);
        }
        try {
          await ensureAuth();
          prefetchProfileIfMissing();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : t('auth.loginFailed');
          console.warn('[auth] ensureAuth failed:', message);
        }
      })();
    }
    preloadEventSubpackage();
  });

  return (
    <LucideTaroProvider defaultColor="#ffffff" defaultSize={24}>
      <View className="s-app-shell">
        <View className="s-app-shell__viewport">{children}</View>
        <NavigationLoadingOverlay />
        <ThemedLoadingModal />
      </View>
    </LucideTaroProvider>
  );
}
