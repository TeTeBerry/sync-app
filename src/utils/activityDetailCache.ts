/**
 * Layer 2 prefetch seed — writes the same keys as `useActivityDetailQuery`
 * (`['activities', 'detail', legacyId]`). Not a separate store; data lives in
 * `useApiQuery` globalCache. Call `invalidateActivities()` to clear seeds.
 */
import { broadcastCacheData, setCacheData } from '../hooks/useApiQuery';
import type { BackendActivity, HomeSummary } from '../types/backend';
import type { EventCardUi, FeaturedEvent } from './apiMappers';
import { parseActivityLegacyId } from './activityLegacyId';

function detailQueryKey(legacyId: number) {
  return ['activities', 'detail', legacyId] as const;
}

function minimalActivity(
  legacyId: number,
  fields: Partial<BackendActivity>,
): BackendActivity {
  return {
    _id: fields._id ?? String(legacyId),
    legacyId,
    code: fields.code ?? String(legacyId),
    name: fields.name ?? '',
    date: fields.date,
    location: fields.location,
    image: fields.image,
    hot: fields.hot,
    attendees: fields.attendees,
    alias: fields.alias,
    damaiProjectId: fields.damaiProjectId,
    externalUrl: fields.externalUrl,
    region: fields.region,
    area: fields.area,
    activityType: fields.activityType,
    lineupPublished: fields.lineupPublished,
    recruitPostCount: fields.recruitPostCount,
    infoSource: fields.infoSource,
    infoUpdatedAt: fields.infoUpdatedAt,
  };
}

/** Warm activity-detail query cache so event-detail can paint header without full skeleton. */
export function seedActivityDetailCache(activity: BackendActivity): void {
  const legacyId = parseActivityLegacyId(activity.legacyId);
  if (legacyId == null) {
    return;
  }
  setCacheData<BackendActivity | null>([...detailQueryKey(legacyId)], (prev) => {
    if (!prev) {
      return activity;
    }
    return { ...prev, ...activity, legacyId };
  });
  broadcastCacheData([...detailQueryKey(legacyId)]);
}

export function seedActivityDetailsFromList(activities: BackendActivity[]): void {
  for (const activity of activities) {
    seedActivityDetailCache(activity);
  }
}

export function seedActivityDetailFromEventCard(event: EventCardUi): void {
  const legacyId = parseActivityLegacyId(event.id);
  if (legacyId == null) {
    return;
  }
  seedActivityDetailCache(
    minimalActivity(legacyId, {
      name: event.title,
      date: event.date,
      location: event.location,
      image: event.image,
      hot: event.hot,
      attendees: event.attendees,
      region: event.region,
      area: event.area,
      lineupPublished: event.lineupPublished,
      recruitPostCount: event.recruitPostCount,
      infoSource: event.infoSource,
      infoUpdatedAt: event.infoUpdatedAt,
      alias: event.alias,
    }),
  );
}

export function seedActivityDetailFromHomeSignupEvent(
  event: HomeSummary['signupEvents'][number],
): void {
  const legacyId = parseActivityLegacyId(event.id);
  if (legacyId == null) {
    return;
  }
  seedActivityDetailCache(
    minimalActivity(legacyId, {
      name: event.title,
      date: event.date,
      location: event.location,
      image: event.image,
      hot: event.hot,
      attendees: event.attendees,
      region: event.region,
      area: event.area,
    }),
  );
}

export function seedActivityDetailsFromHomeSummary(summary: HomeSummary): void {
  for (const event of summary.signupEvents) {
    seedActivityDetailFromHomeSignupEvent(event);
  }
}

export function seedActivityDetailFromFeaturedEvent(event: FeaturedEvent): void {
  const legacyId = parseActivityLegacyId(event.legacyId ?? event.id);
  if (legacyId == null) {
    return;
  }
  seedActivityDetailCache(
    minimalActivity(legacyId, {
      name: event.title,
      date: event.date,
      location: event.venue,
      image: event.image,
      hot: event.isHot,
    }),
  );
}
