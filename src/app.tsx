import './utils/abortControllerPolyfill';
import { hydrateAppCachesFromStorage } from './utils/homeCacheStorage';

hydrateAppCachesFromStorage();

import './app.scss';
import { useDidHide, useLaunch } from '@tarojs/taro';
import { clearAiChatEphemeralState } from './utils/aiChatEphemeral';
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

export default function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    initCloudBase();
    if (isLiveApi()) {
      prefetchCoreQueriesOnLaunch();
      void ensureAuth()
        .then(() => {
          prefetchProfileIfMissing();
        })
        .catch((error) => {
          const message =
            error instanceof Error ? error.message : '登录失败，请稍后重试';
          console.warn('[auth] ensureAuth failed:', message);
        });
    }
    preloadEventSubpackage();
  });

  useDidHide(() => {
    clearAiChatEphemeralState();
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
