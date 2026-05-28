import "./app.scss";
import { View } from "@tarojs/components";
import type { PropsWithChildren } from "react";

export default function App({ children }: PropsWithChildren) {
  return (
    <View className="s-app-shell">
      <View className="s-app-shell__viewport">{children}</View>
    </View>
  );
}
