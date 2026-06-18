export type EventDetailHeaderQueryView = {
  data?: { name?: string; date?: string; location?: string } | null;
  isLoading: boolean;
  isError: boolean;
};

export function resolveEventDetailHeaderPresentation(options: {
  hasValidEventId: boolean;
  query: EventDetailHeaderQueryView;
}) {
  const { hasValidEventId, query } = options;
  const title = query.data?.name;
  const activityDate = query.data?.date;
  const activityLocation = query.data?.location;

  const showHeaderSkeleton =
    hasValidEventId &&
    !title &&
    !query.isError &&
    (query.isLoading || query.data === undefined);

  const showActivityMissing =
    hasValidEventId &&
    !title &&
    !query.isLoading &&
    !showHeaderSkeleton &&
    (query.isError || query.data === null);

  const routeContentReady = Boolean(title) || showHeaderSkeleton || showActivityMissing;
  const loadError = query.isError && !query.isLoading;

  const metaLine = query.data
    ? [query.data.date, query.data.location].filter(Boolean).join(' · ')
    : '';

  return {
    title,
    activityDate,
    activityLocation,
    metaLine,
    showHeaderSkeleton,
    showActivityMissing,
    routeContentReady,
    loadError,
  };
}
