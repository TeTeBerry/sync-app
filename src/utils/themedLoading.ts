import { useLoadingStore, type ThemedLoadingOptions } from '../stores/loadingStore';

export type { ThemedLoadingOptions };

/** Themed loading modal — drop-in replacement for Taro.showLoading. */
export function showThemedLoading(options?: ThemedLoadingOptions | string): void {
  useLoadingStore.getState().show(options);
}

/** Hide the themed loading modal — drop-in replacement for Taro.hideLoading. */
export function hideThemedLoading(): void {
  useLoadingStore.getState().hide();
}
