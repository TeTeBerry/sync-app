import { create } from 'zustand';

export type ThemedLoadingOptions = {
  title?: string;
  /** Block interaction behind the loader (default true). */
  mask?: boolean;
};

interface LoadingState {
  count: number;
  title: string | undefined;
  show: (options?: ThemedLoadingOptions | string) => void;
  hide: () => void;
}

function resolveTitle(options?: ThemedLoadingOptions | string): string | undefined {
  if (typeof options === 'string') {
    return options;
  }
  return options?.title;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  count: 0,
  title: undefined,
  show: (options) =>
    set((state) => {
      const nextTitle = resolveTitle(options) ?? state.title;
      return { count: state.count + 1, title: nextTitle };
    }),
  hide: () =>
    set((state) => {
      const count = Math.max(0, state.count - 1);
      return { count, title: count === 0 ? undefined : state.title };
    }),
}));

export const selectLoadingActive = (state: LoadingState) => state.count > 0;
export const selectLoadingTitle = (state: LoadingState) => state.title;
