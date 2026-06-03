import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';

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

export type UseKeyboardInsetOptions = {
  /** When false, use full keyboard height (stack pages without tab bar). Default true. */
  subtractTabBar?: boolean;
};

/**
 * Keyboard height to lift fixed footers on WeChat mini programs.
 * Use with `adjustPosition={false}` on the focused input to avoid double lift.
 * The composer sits above the tab bar, so subtract tab bar chrome from keyboard height.
 */
export function useKeyboardInset(options?: UseKeyboardInsetOptions): number {
  const subtractTabBar = options?.subtractTabBar !== false;
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (process.env.TARO_ENV !== 'weapp') return;
    if (typeof Taro.onKeyboardHeightChange !== 'function') return;

    const tabBarPx = subtractTabBar ? tabBarOffsetPx() : 0;

    const onChange: Taro.onKeyboardHeightChange.Callback = (res) => {
      const height = res.height ?? 0;
      if (height <= 0) {
        setInset(0);
        return;
      }
      setInset(Math.max(0, height - tabBarPx));
    };

    Taro.onKeyboardHeightChange(onChange);
    return () => {
      Taro.offKeyboardHeightChange(onChange);
    };
  }, [subtractTabBar]);

  return inset;
}
