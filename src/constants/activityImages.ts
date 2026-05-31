import activity1Thumb from "../assets/images/activities/activity-1.jpg";
import activity2Thumb from "../assets/images/activities/activity-2.jpg";
import activity4StormThumb from "../assets/images/activities/activity-4-storm.jpg";
import activity5Thumb from "../assets/images/activities/activity-5.jpg";
import activity6Thumb from "../assets/images/activities/activity-6.jpg";
import { PLACEHOLDER_EVENT_HERO } from "./remoteImages";
import { thumbnailImageUrl } from "../utils/imageUrl";

/**
 * Bundled activity thumbnails (no network on first paint).
 * Sources: activity.seed.ts / sync-activity-catalog.mjs official URLs.
 * - 1 Tomorrowland Thailand: PR Newswire (TAT announcement)
 * - 2 EDC China: electricdaisycarnival.cn
 * - 4 Storm: Damai 大麦 verticalPic (project 1048730418844)
 * - 5 EDC Thailand: Eventpop official poster (Insomniac ticketing partner)
 * - 6 VAC Zhuhai: 广州日报 huacheng 发布会官方稿图
 */
const BUNDLED_ACTIVITY_THUMB_BY_LEGACY_ID: Partial<Record<number, string>> = {
  1: activity1Thumb,
  2: activity2Thumb,
  4: activity4StormThumb,
  5: activity5Thumb,
  6: activity6Thumb,
};

/** Resolve list/card thumb: local bundle first, then resized remote, then placeholder. */
export function resolveActivityThumb(
  legacyId: number | null | undefined,
  remoteUrl?: string,
  width = 200,
): string {
  const id = legacyId != null && legacyId > 0 ? legacyId : null;
  if (id != null && BUNDLED_ACTIVITY_THUMB_BY_LEGACY_ID[id]) {
    return BUNDLED_ACTIVITY_THUMB_BY_LEGACY_ID[id]!;
  }
  const remote = thumbnailImageUrl(remoteUrl, width);
  if (remote) return remote;
  return thumbnailImageUrl(PLACEHOLDER_EVENT_HERO, width) ?? PLACEHOLDER_EVENT_HERO;
}
