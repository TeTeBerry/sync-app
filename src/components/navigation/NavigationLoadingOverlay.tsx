import './NavigationLoadingOverlay.scss';
import { useEffect, useMemo } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import {
  selectRouteTransitionActive,
  selectRouteTransitionTabTarget,
} from '../../stores/navigationSelectors';
import { endRouteTransition, ROUTES } from '../../utils/route';
import ThemedPageLoader, { type ThemedPageLoaderVariant } from '../ThemedPageLoader';

const ROUTE_TRANSITION_MAX_MS = 12_000;

function tabSwitchLoaderVariant(
  tabTarget: string | undefined,
): ThemedPageLoaderVariant {
  if (tabTarget === ROUTES.PROFILE) {
    return 'skeleton-feed';
  }
  if (tabTarget === ROUTES.HOME || tabTarget === ROUTES.EVENTS) {
    return 'skeleton-feed';
  }
  return 'spinner';
}

/** Global pink-on-black loader from navigate / tab tap until destination page is ready. */
export default function NavigationLoadingOverlay() {
  const active = useNavigationStore(selectRouteTransitionActive);
  const tabTarget = useNavigationStore(selectRouteTransitionTabTarget);
  const variant = useMemo(() => tabSwitchLoaderVariant(tabTarget), [tabTarget]);
  const isTabSwitch = tabTarget != null;

  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = setTimeout(() => endRouteTransition(), ROUTE_TRANSITION_MAX_MS);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <ThemedPageLoader
      overlay
      variant={variant}
      label={isTabSwitch ? undefined : '加载中…'}
      showBrand={!isTabSwitch || variant === 'spinner'}
      minHeight={variant === 'skeleton-feed' ? 320 : undefined}
      className="s-nav-loading-overlay"
    />
  );
}
