import type { PropsWithChildren } from 'react';

/** Per-icon lucide imports use isolated context modules; keep API for app shell. */
export function LucideTaroProvider({
  children,
}: PropsWithChildren<{
  defaultColor?: string;
  defaultSize?: number;
}>) {
  return children;
}
