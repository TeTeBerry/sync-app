import "./utils/abortControllerPolyfill";
import { hydrateHomeCachesFromStorage } from "./utils/homeCacheStorage";

hydrateHomeCachesFromStorage();

import "./app.scss";
import { useLaunch } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { LucideTaroProvider } from "lucide-react-taro";
import type { PropsWithChildren } from "react";
import NavigationLoadingOverlay from "./components/NavigationLoadingOverlay";
import { preloadHotRoutes } from "./utils/route";
import { preloadEventSubpackage } from "./utils/subpackagePreload";

export default function App({ children }: PropsWithChildren) {
  useLaunch(() => {
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
