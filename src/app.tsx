import "./utils/abortControllerPolyfill";
import "./app.scss";
import { View } from "@tarojs/components";
import { LucideTaroProvider } from "lucide-react-taro";
import type { PropsWithChildren } from "react";
import NavigationLoadingOverlay from "./components/NavigationLoadingOverlay";

export default function App({ children }: PropsWithChildren) {
  return (
    <LucideTaroProvider defaultColor="#ffffff" defaultSize={24}>
      <View className="s-app-shell">
        <View className="s-app-shell__viewport">
          {children}
          <NavigationLoadingOverlay />
        </View>
      </View>
    </LucideTaroProvider>
  );
}
