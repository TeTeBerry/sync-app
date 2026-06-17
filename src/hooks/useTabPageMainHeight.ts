import Taro from '@tarojs/taro';
import { useMemo } from 'react';
import { stackPageNavChromePx } from '../components/navigation/PageNavigation';
import { useNavBarInsets } from './useNavBarInsets';
import { computeTabPageMainHeightFallback } from './tabPageMainHeight.util';

export { computeTabPageMainHeightFallback } from './tabPageMainHeight.util';

/** Fallback when window metrics are unavailable (≈ design @ 375 + status bar). */
export const STACK_PAGE_NAV_PX = 100;

/** Matches TabPageHeader profile/events row + bottom padding (px, design @ 375). */
export const TAB_PAGE_NAV_PX = 48;

/** Brand-only TabPageHeader row + bottom padding (profile tab; px @ 375). */
export const TAB_PAGE_HEADER_BRAND_PX = 36;

export type TabPageMainHeightOptions = {
  /** Fixed chrome inside the main column (headers, composers, toolbars, etc.). */
  subtractPx?: number;
};

/**
 * Explicit main-area height for tab pages on WeChat: `scroll-view` does not
 * honor flex `height: 0` and will grow with content, pushing BottomNav off-screen
 * when the page has `disableScroll: true`.
 */
export function useTabPageMainHeight(
  options?: TabPageMainHeightOptions | number,
): number | undefined {
  const subtractPx = typeof options === 'number' ? options : (options?.subtractPx ?? 0);

  return useMemo(() => computeTabPageMainHeightFallback(subtractPx), [subtractPx]);
}

/** Stack pages without BottomNav (PageNavigation + internal ScrollView). */
export function useStackPageMainHeight(
  options?: TabPageMainHeightOptions | number,
): number | undefined {
  const navInsets = useNavBarInsets();
  const extraSubtract =
    typeof options === 'number' ? options : (options?.subtractPx ?? 0);
  const navChrome = stackPageNavChromePx(navInsets);

  return useMemo(() => {
    try {
      const win = Taro.getWindowInfo();
      const windowHeight = win.windowHeight ?? win.screenHeight ?? 667;
      return Math.max(200, Math.floor(windowHeight - navChrome - extraSubtract));
    } catch {
      return undefined;
    }
  }, [extraSubtract, navChrome]);
}
