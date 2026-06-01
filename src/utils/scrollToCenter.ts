import Taro from '@tarojs/taro';

type ScrollViewRect = {
  scrollTop?: number;
  height?: number;
  top?: number;
};

type TargetRect = {
  top?: number;
  height?: number;
};

/**
 * Compute scrollTop so `targetSelector` is vertically centered in `scrollViewSelector`.
 * Uses WeChat/Taro selector query (scrollOffset + boundingClientRect).
 */
export function measureScrollTopToCenter(
  scrollViewSelector: string,
  targetSelector: string,
): Promise<number | null> {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery();
    query
      .select(scrollViewSelector)
      .fields({ size: true, scrollOffset: true, rect: true });
    query.select(targetSelector).boundingClientRect();
    query.exec((res) => {
      const scrollView = res?.[0] as ScrollViewRect | null;
      const target = res?.[1] as TargetRect | null;
      if (
        !scrollView ||
        !target ||
        scrollView.scrollTop == null ||
        scrollView.height == null ||
        scrollView.top == null ||
        target.top == null ||
        target.height == null
      ) {
        resolve(null);
        return;
      }

      const offsetInView = target.top - scrollView.top;
      const centered =
        scrollView.scrollTop + offsetInView - scrollView.height / 2 + target.height / 2;
      resolve(Math.max(0, Math.round(centered)));
    });
  });
}

/** Reset then apply scrollTop so ScrollView picks up the new value. */
export function applyScrollTop(
  setScrollTop: (value: number | undefined) => void,
  value: number,
): void {
  setScrollTop(undefined);
  setTimeout(() => setScrollTop(value), 0);
}

export async function scrollElementToCenter(
  scrollViewSelector: string,
  targetSelector: string,
  setScrollTop: (value: number | undefined) => void,
): Promise<boolean> {
  const top = await measureScrollTopToCenter(scrollViewSelector, targetSelector);
  if (top == null) return false;
  applyScrollTop(setScrollTop, top);
  return true;
}
