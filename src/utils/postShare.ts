import { stripContentTypeHashtags } from "./postContentTypeDisplay";
import { buildQueryString } from "./queryString";
import { sanitizeRemoteImageUrl } from "./imageUrl";

/** Keep in sync with `ROUTES` in `utils/route.ts`. */
const SHARE_PATHS = {
  home: "/pages/index/index",
  eventDetail: "/packageEvent/pages/event-detail/index",
} as const;

const SHARE_TITLE_MAX = 32;

export type PostSharePayload = {
  postId: string;
  activityLegacyId?: number;
  body?: string;
  eventTitle?: string;
  authorName?: string;
  imageUrl?: string;
  images?: string[];
};

export function buildPostShareTitle(
  payload: Pick<PostSharePayload, "body" | "eventTitle" | "authorName">,
): string {
  const snippet = stripContentTypeHashtags(payload.body ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (snippet) {
    return snippet.length > SHARE_TITLE_MAX ? `${snippet.slice(0, SHARE_TITLE_MAX)}…` : snippet;
  }
  const eventTitle = payload.eventTitle?.trim();
  if (eventTitle) {
    return `${eventTitle} · 组队帖`;
  }
  const authorName = payload.authorName?.trim();
  if (authorName) {
    return `${authorName}的组队帖`;
  }
  return "发现精彩组队帖";
}

export function buildPostSharePagePath(
  payload: Pick<PostSharePayload, "postId" | "activityLegacyId">,
): string {
  const legacyId = payload.activityLegacyId;
  if (legacyId != null && Number.isFinite(legacyId) && legacyId > 0) {
    const query: Record<string, string> = {
      id: String(legacyId),
      activityLegacyId: String(legacyId),
    };
    const postId = payload.postId?.trim();
    if (postId) {
      query.postId = postId;
    }
    const qs = buildQueryString(query);
    return qs ? `${SHARE_PATHS.eventDetail}?${qs}` : SHARE_PATHS.eventDetail;
  }
  return SHARE_PATHS.home;
}

export function resolvePostShareImageUrl(
  payload: Pick<PostSharePayload, "imageUrl" | "images">,
): string | undefined {
  const candidate = payload.imageUrl?.trim() || payload.images?.[0]?.trim();
  return sanitizeRemoteImageUrl(candidate);
}

export function toPostShareAppMessage(payload: PostSharePayload) {
  return {
    title: buildPostShareTitle(payload),
    path: buildPostSharePagePath(payload),
    imageUrl: resolvePostShareImageUrl(payload),
  };
}

export const DEFAULT_POST_PAGE_SHARE = {
  title: "发现同频活动，一起组队",
  path: SHARE_PATHS.home,
} as const;
