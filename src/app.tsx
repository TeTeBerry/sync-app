import './utils/abortControllerPolyfill';
import { hydrateHomeCachesFromStorage } from './utils/homeCacheStorage';

hydrateHomeCachesFromStorage();

import './app.scss';
import Taro, { useLaunch } from '@tarojs/taro';
import { ensureAuth } from './utils/auth';
import { isApiEnabled } from './constants/api';
import { View } from '@tarojs/components';
import { LucideTaroProvider } from 'lucide-react-taro';
import type { PropsWithChildren } from 'react';
import NavigationLoadingOverlay from './components/NavigationLoadingOverlay';
import { preloadHotRoutes } from './utils/route';
import { preloadEventSubpackage } from './utils/subpackagePreload';

export default function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    if (isApiEnabled()) {
      void ensureAuth().catch((error) => {
        const message =
          error instanceof Error ? error.message : '登录失败，请稍后重试';
        console.warn('[auth] ensureAuth failed:', message);
      });
    }
    preloadEventSubpackage();
    preloadHotRoutes();
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
