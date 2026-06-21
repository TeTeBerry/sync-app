import './utils/abortControllerPolyfill';
import { hydrateAppCachesFromStorage } from './utils/homeCacheStorage';

hydrateAppCachesFromStorage();

import './app.scss';
import { useLaunch } from '@tarojs/taro';
import { ensureAuth } from './utils/auth';
import { isLiveApi } from './constants/api';
import { View } from '@tarojs/components';
import { LucideTaroProvider } from './components/icons';
import type { PropsWithChildren } from 'react';
import NavigationLoadingOverlay from './components/navigation/NavigationLoadingOverlay';
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
    useLocaleStore.getState().hydrate();
    initCloudBase();
    if (isLiveApi()) {
      prefetchCoreQueriesOnLaunch();
      void ensureAuth()
        .then(() => {
          prefetchProfileIfMissing();
        })
        .catch((error) => {
          const message =
            error instanceof Error ? error.message : t('auth.loginFailed');
          console.warn('[auth] ensureAuth failed:', message);
        });
    }
    preloadEventSubpackage();
  });

  return (
    <LucideTaroProvider defaultColor="#ffffff" defaultSize={24}>
      <View className="s-app-shell">
        <View className="s-app-shell__viewport">{children}</View>
        <NavigationLoadingOverlay />
      </View>
    </LucideTaroProvider>
  );
}
