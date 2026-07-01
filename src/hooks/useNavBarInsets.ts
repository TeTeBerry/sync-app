import Taro from '@tarojs/taro';
import { useMemo } from 'react';

export type NavBarInsets = {
  /** 状态栏 + 导航内容区顶部留白 */
  paddingTop: number;
  /** 右侧避开微信胶囊 */
  paddingRight: number;
};

const TOP_GAP = 8;

const DEFAULT: NavBarInsets = {
  paddingTop: 52,
  paddingRight: 16,
};

/** 右侧避开微信胶囊（仅用于顶栏 Hero，勿用于整页） */
export function useNavBarInsets(): NavBarInsets {
  return useMemo(() => {
    try {
      const windowInfo = Taro.getWindowInfo();
      const statusBarHeight = windowInfo.statusBarHeight ?? 44;
      if (process.env.TARO_ENV !== 'weapp') {
        return {
          paddingTop: statusBarHeight + TOP_GAP,
          paddingRight: 16,
        };
      }

      const windowWidth = windowInfo.windowWidth ?? 375;
      const menuRect = Taro.getMenuButtonBoundingClientRect();
      if (menuRect && menuRect.width > 0 && menuRect.top > 0) {
        const capsuleReserve = windowWidth - menuRect.left + 8;
        // Align hero row with capsule top — do not pad to menu bottom (causes huge gap).
        const paddingTop = Math.max(statusBarHeight + TOP_GAP, menuRect.top);
        return {
          paddingTop,
          paddingRight: Math.max(16, capsuleReserve),
        };
      }

      return {
        paddingTop: statusBarHeight + TOP_GAP,
        paddingRight: 16,
      };
    } catch {
      return DEFAULT;
    }
  }, []);
}
