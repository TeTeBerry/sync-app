import { useDidShow } from '@tarojs/taro';
import { useEffect } from 'react';
import { endRouteTransition } from '../utils/route';

/** Clears global route-transition UI once page content is ready. */
export function usePageRouteReady(isContentReady: boolean) {
  useEffect(() => {
    if (isContentReady) {
      endRouteTransition();
    }
  }, [isContentReady]);

  useDidShow(() => {
    if (isContentReady) {
      endRouteTransition();
    }
  });
}
