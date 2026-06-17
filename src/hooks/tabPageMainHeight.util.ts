import Taro from '@tarojs/taro';

/** Matches BottomNav.scss: row + top padding (px, design @ 375). */
const TABBAR_ROW_PX = 56;
const TABBAR_PADDING_TOP_PX = 10;

/** Window height minus tab bar — ScrollView fallback when flex measure is unavailable. */
export function computeTabPageMainHeightFallback(subtractPx = 0): number | undefined {
  try {
    const win = Taro.getWindowInfo();
    const windowHeight = win.windowHeight ?? win.screenHeight ?? 667;
    const screenHeight = win.screenHeight ?? windowHeight;
    const safeBottom =
      win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
    const tabBarPx = TABBAR_ROW_PX + TABBAR_PADDING_TOP_PX + safeBottom;
    return Math.max(200, Math.floor(windowHeight - tabBarPx - subtractPx));
  } catch {
    return undefined;
  }
}
