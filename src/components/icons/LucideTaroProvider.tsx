import type { PropsWithChildren } from 'react';

/**
 * App shell wrapper — per-icon lucide imports cannot share LucideTaroContext.
 * Default icon color is applied in `icons/index.ts` via `withDefaultIconColor`.
 */
export function LucideTaroProvider({
  children,
}: PropsWithChildren<{
  defaultColor?: string;
  defaultSize?: number;
}>) {
  return children;
}
