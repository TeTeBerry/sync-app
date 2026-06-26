/** Align Unity recruit count with the recruit wall feed (US-Q2-58). */
export function resolveUnityRecruitCount(
  catalogCount: number | undefined,
  feedCount: number | undefined,
  feedReady: boolean,
  feedHasMore = false,
): number {
  const fromCatalog = catalogCount ?? 0;
  const fromFeed = feedCount ?? 0;
  if (!feedReady) {
    return fromCatalog;
  }
  if (feedHasMore && fromCatalog > fromFeed) {
    return fromCatalog;
  }
  return Math.max(fromCatalog, fromFeed);
}
