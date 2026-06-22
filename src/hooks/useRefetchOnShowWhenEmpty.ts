import { useDidShow } from '@tarojs/taro';

type RefetchFn = (options?: { background?: boolean }) => Promise<unknown>;

type UseRefetchOnShowWhenEmptyOptions = {
  data: unknown;
  isError?: boolean;
  isLoading?: boolean;
  refetch: RefetchFn;
  enabled?: boolean;
};

/** Tab show: retry when the first cold-start fetch failed or never populated cache. */
export function useRefetchOnShowWhenEmpty({
  data,
  isError = false,
  isLoading = false,
  refetch,
  enabled = true,
}: UseRefetchOnShowWhenEmptyOptions): void {
  useDidShow(() => {
    if (!enabled) return;
    if (data !== undefined && !isError) return;
    void refetch({ background: isLoading });
  });
}
