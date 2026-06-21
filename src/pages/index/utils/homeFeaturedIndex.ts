export function buildFeaturedEventsKey(
  events: ReadonlyArray<{ id: number | string }>,
): string {
  return events.map((event) => String(event.id)).join('|');
}

/** Preserve swiper index on refresh; reset only when featured list identity changes. */
export function resolveFeaturedIndexAfterListChange(
  prevIndex: number,
  prevKey: string,
  nextKey: string,
  nextLength: number,
): number {
  if (nextLength <= 0) {
    return 0;
  }
  if (prevKey !== nextKey) {
    return 0;
  }
  return Math.min(prevIndex, nextLength - 1);
}
