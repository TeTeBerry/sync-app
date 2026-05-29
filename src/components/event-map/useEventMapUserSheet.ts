import { useMemo } from "react";
import { fetchUserPosts } from "../../api/syncApi";
import { isApiEnabled } from "../../constants/api";
import type { EventDetailPost } from "../../types/backend";
import { formatPostPublishTime } from "../../utils/formatPostPublishTime";
import { sanitizeImageList, sanitizeRemoteImageUrl } from "../../utils/imageUrl";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useEventPostsQuery } from "../../hooks/useSyncApi";
import type { EventMapMarker } from "./eventMapMarkers";
import {
  buildEventMapUserSheetData,
  getEventMapUserSheetMockData,
  mapEventDetailPostToEventMapUserPost,
  mapProfilePostToEventMapUserPost,
  type EventMapUserPost,
} from "./eventMapUserPostsData";

const STORM_ACTIVITY_LEGACY_ID = 4;

function resolveActivityLegacyId(
  fromRoute: number | undefined,
  activeLegacyId: number | null,
): number {
  if (fromRoute != null && !Number.isNaN(fromRoute) && fromRoute > 0) {
    return fromRoute;
  }
  if (activeLegacyId != null && activeLegacyId > 0) {
    return activeLegacyId;
  }
  return STORM_ACTIVITY_LEGACY_ID;
}

function mapActivityPostsForUser(
  posts: EventDetailPost[] | undefined,
  userId: string,
): EventMapUserPost[] {
  if (!posts?.length) return [];

  return posts
    .filter((post) => post.userId === userId)
    .map((post) => {
      const sanitized: EventDetailPost = {
        ...post,
        avatar: sanitizeRemoteImageUrl(post.avatar) ?? post.avatar,
        images: sanitizeImageList(post.images),
      };
      return mapEventDetailPostToEventMapUserPost(
        sanitized,
        formatPostPublishTime,
      );
    });
}

export function useEventMapUserSheet(
  marker: EventMapMarker | null,
  open: boolean,
  activityLegacyIdFromRoute?: number,
  activeActivityLegacyId?: number | null,
) {
  const apiEnabled = isApiEnabled();
  const activityLegacyId = resolveActivityLegacyId(
    activityLegacyIdFromRoute,
    activeActivityLegacyId ?? null,
  );

  const sheetEnabled = open && Boolean(marker);
  const userId = marker?.userId ?? "";

  const activityPostsQuery = useEventPostsQuery(activityLegacyId, {
    enabled: apiEnabled && sheetEnabled,
  });

  const activityPosts = useMemo(
    () => mapActivityPostsForUser(activityPostsQuery.data, userId),
    [activityPostsQuery.data, userId],
  );

  const needProfileFallback =
    activityPostsQuery.isError ||
    (activityPostsQuery.data !== undefined && activityPosts.length === 0);

  const profilePostsQuery = useApiQuery({
    queryKey: ["profile", "posts", "user", userId, marker?.authorName],
    queryFn: () => fetchUserPosts(userId, marker?.authorName),
    enabled:
      apiEnabled &&
      sheetEnabled &&
      Boolean(userId) &&
      needProfileFallback &&
      !activityPostsQuery.isLoading,
    staleTime: 30_000,
  });

  const profilePosts = useMemo(
    () =>
      (profilePostsQuery.data ?? []).map(mapProfilePostToEventMapUserPost),
    [profilePostsQuery.data],
  );

  const posts = activityPosts.length > 0 ? activityPosts : profilePosts;

  const authorFromActivity = useMemo(() => {
    const match = activityPostsQuery.data?.find((p) => p.userId === userId);
    if (!match) return undefined;
    return {
      name: match.name,
      avatar: sanitizeRemoteImageUrl(match.avatar) ?? match.avatar,
    };
  }, [activityPostsQuery.data, userId]);

  const sheet = useMemo(() => {
    if (!marker) return null;
    if (!apiEnabled) {
      return getEventMapUserSheetMockData(marker);
    }
    return buildEventMapUserSheetData(marker, posts, {
      authorDisplayName: authorFromActivity?.name,
      authorAvatar: authorFromActivity?.avatar,
    });
  }, [apiEnabled, marker, posts, authorFromActivity]);

  const isLoading =
    apiEnabled &&
    sheetEnabled &&
    !posts.length &&
    (activityPostsQuery.isLoading ||
      (needProfileFallback && profilePostsQuery.isLoading));

  const isError =
    apiEnabled &&
    sheetEnabled &&
    !posts.length &&
    !isLoading &&
    activityPostsQuery.isError &&
    (needProfileFallback ? profilePostsQuery.isError : true);

  return {
    sheet,
    isLoading,
    isError,
    activityLegacyId,
  };
}
