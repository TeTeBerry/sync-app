import { useDidShow } from '@tarojs/taro';
import {
  endRouteTransition,
  isTabRoute,
  syncTabBarRoute,
  type RoutePath,
} from '../utils/route';
import { useNavigationStore } from '../stores/navigationStore';

/** Whether this page show should dismiss the global route-transition overlay. */
export function shouldEndRouteTransitionOnShow(
  transition: { active: boolean; tabTarget?: string },
  ownTabPath?: RoutePath,
): boolean {
  if (!transition.active) {
    return false;
  }
  if (transition.tabTarget != null) {
    return ownTabPath != null && transition.tabTarget === ownTabPath;
  }
  return true;
}

/**
 * Clears global route-transition overlay when a page becomes visible.
 * Tab pages should pass their route so intermediate tabs during switchTab
 * (e.g. home under event-detail) do not dismiss the overlay early.
 */
export function useEndRouteTransitionOnShow(ownTabPath?: RoutePath) {
  useDidShow(() => {
    if (ownTabPath && isTabRoute(ownTabPath)) {
      syncTabBarRoute(ownTabPath);
    }

    const transition = useNavigationStore.getState().routeTransition;
    if (!shouldEndRouteTransitionOnShow(transition, ownTabPath)) {
      return;
    }
    endRouteTransition();
  });
}
