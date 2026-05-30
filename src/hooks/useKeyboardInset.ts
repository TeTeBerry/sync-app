import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";

/** Matches BottomNav.scss + useTabPageMainHeight tab bar estimate. */
const TABBAR_ROW_PX = 56;
const TABBAR_PADDING_TOP_PX = 10;

function tabBarOffsetPx(): number {
  try {
    const win = Taro.getWindowInfo();
    const screenHeight = win.screenHeight ?? win.windowHeight ?? 667;
    const safeBottom =
      win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
    return TABBAR_ROW_PX + TABBAR_PADDING_TOP_PX + safeBottom;
  } catch {
    return TABBAR_ROW_PX + TABBAR_PADDING_TOP_PX;
  }
}

/**
 * Keyboard height to lift fixed footers on WeChat mini programs.
 * The composer sits above the tab bar, so subtract tab bar chrome when the
 * keyboard is taller than the tab bar.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (process.env.TARO_ENV !== "weapp") return;
    if (typeof Taro.onKeyboardHeightChange !== "function") return;

    const tabBarPx = tabBarOffsetPx();

    const onChange: Taro.onKeyboardHeightChange.Callback = (res) => {
      const height = res.height ?? 0;
      setInset(height > 0 ? Math.max(0, height - tabBarPx) : 0);
    };

    Taro.onKeyboardHeightChange(onChange);
    return () => {
      Taro.offKeyboardHeightChange(onChange);
    };
  }, []);

  return inset;
}
