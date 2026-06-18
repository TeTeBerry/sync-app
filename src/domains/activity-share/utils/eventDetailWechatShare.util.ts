import { resolveCatalogActivityImage } from '@/constants/activityCatalogImages';
import type { BackendActivity } from '@/types/backend';
import { buildEventDetailQuery, ROUTES } from '@/utils/route';
import { buildQueryString } from '@/utils/queryString';

const SHARE_TITLE_MAX = 48;

function truncateShareField(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, max - 1))}…`;
}

export function buildEventDetailShareTitle(
  activity: Pick<BackendActivity, 'name' | 'date' | 'location'>,
): string {
  const parts = [
    activity.name?.trim(),
    activity.date?.trim(),
    activity.location?.trim(),
  ].filter(Boolean);
  const joined = parts.join(' · ');
  return truncateShareField(joined || '活动详情', SHARE_TITLE_MAX);
}

export function buildEventDetailSharePath(
  legacyId: number,
  options?: { postId?: string; focusPosts?: boolean },
): string {
  const query = buildEventDetailQuery(legacyId, options);
  const qs = buildQueryString(query);
  return qs ? `${ROUTES.EVENT_DETAIL}?${qs}` : ROUTES.EVENT_DETAIL;
}

export function buildEventDetailShareImageUrl(
  legacyId: number,
  image?: string | null,
): string | undefined {
  const url = resolveCatalogActivityImage(legacyId, image)?.trim();
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

export type EventDetailShareActivity = Pick<
  BackendActivity,
  'legacyId' | 'name' | 'date' | 'location' | 'image'
>;

export function buildEventDetailShareAppMessage(
  activity: EventDetailShareActivity,
  options?: { postId?: string; focusPosts?: boolean },
) {
  return {
    title: buildEventDetailShareTitle(activity),
    path: buildEventDetailSharePath(activity.legacyId, options),
    imageUrl: buildEventDetailShareImageUrl(activity.legacyId, activity.image),
  };
}

export function buildEventDetailShareTimeline(
  activity: EventDetailShareActivity,
  options?: { postId?: string; focusPosts?: boolean },
) {
  const query =
    buildEventDetailSharePath(activity.legacyId, options).split('?')[1] ?? '';
  return {
    title: buildEventDetailShareTitle(activity),
    query,
    imageUrl: buildEventDetailShareImageUrl(activity.legacyId, activity.image),
  };
}

export function buildEventDetailShareFallback(legacyId?: number) {
  if (legacyId != null && Number.isFinite(legacyId) && legacyId > 0) {
    return {
      title: '活动详情',
      path: buildEventDetailSharePath(legacyId),
    };
  }
  return {
    title: '活动详情',
    path: ROUTES.EVENT_DETAIL,
  };
}
