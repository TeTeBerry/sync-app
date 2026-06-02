/** Coalesce rapid updates to once per animation frame (e.g. AI stream typewriter). */
export function throttleRaf<Args extends unknown[]>(
  fn: (...args: Args) => void,
): (...args: Args) => void {
  let scheduled = false;
  let pending: Args | null = null;

  return (...args: Args) => {
    pending = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const callArgs = pending;
      pending = null;
      if (callArgs) fn(...callArgs);
    });
  };
}
