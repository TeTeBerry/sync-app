import { useCallback, useEffect, useRef, useState } from 'react';
import Taro, { getCurrentInstance } from '@tarojs/taro';

const MIN_HEIGHT_PX = 80;

function getSelectorQueryScope(): TaroGeneral.IAnyObject | undefined {
  const inst = getCurrentInstance();
  return (inst?.page ?? inst) as TaroGeneral.IAnyObject | undefined;
}

function queryElementHeight(selector: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    try {
      const scope =
        process.env.TARO_ENV === 'weapp' ? getSelectorQueryScope() : undefined;
      let query = Taro.createSelectorQuery();
      if (scope) {
        query = query.in(scope);
      }
      query.select(selector).boundingClientRect();
      query.exec((res) => {
        const rect = res?.[0] as { height?: number } | null | undefined;
        const height = rect?.height;
        if (typeof height === 'number' && height >= MIN_HEIGHT_PX) {
          resolve(Math.floor(height));
          return;
        }
        resolve(undefined);
      });
    } catch {
      resolve(undefined);
    }
  });
}

export type UseMeasuredElementHeightOptions = {
  enabled?: boolean;
  /** Bump when siblings above/below change size (expand/collapse, banners). */
  remeasureKey?: string | number;
  fallbackHeight?: number;
};

/**
 * Measure a flex child's laid-out height (WeChat ScrollView needs explicit px).
 * Uses selector query + window resize; ResizeObserver on H5 when the node exists.
 */
export function useMeasuredElementHeight(
  selector: string,
  options?: UseMeasuredElementHeightOptions,
): number | undefined {
  const enabled = options?.enabled !== false;
  // Avoid seeding ScrollView with a full-page fallback before flex layout settles —
  // that oversizes the scroll layer and can block the composer on WeChat.
  const [height, setHeight] = useState<number | undefined>(undefined);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measure = useCallback(async () => {
    if (!enabled) return;

    const next = await queryElementHeight(selector);
    if (next != null) {
      setHeight(next);
      return;
    }

    if (options?.fallbackHeight != null) {
      setHeight(options.fallbackHeight);
    }
  }, [enabled, options?.fallbackHeight, selector]);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    const run = () => {
      if (!cancelled) void measure();
    };

    run();
    const timers = [0, 80, 200, 400].map((delay) => setTimeout(run, delay));

    const onResize = () => run();
    if (typeof Taro.onWindowResize === 'function') {
      Taro.onWindowResize(onResize);
    }

    if (typeof ResizeObserver !== 'undefined' && typeof document !== 'undefined') {
      observerRef.current?.disconnect();
      const element = document.querySelector(selector);
      if (element) {
        observerRef.current = new ResizeObserver(run);
        observerRef.current.observe(element);
      }
    }

    return () => {
      cancelled = true;
      for (const timer of timers) clearTimeout(timer);
      if (typeof Taro.offWindowResize === 'function') {
        Taro.offWindowResize(onResize);
      }
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [enabled, measure, options?.remeasureKey, selector]);

  return height;
}
