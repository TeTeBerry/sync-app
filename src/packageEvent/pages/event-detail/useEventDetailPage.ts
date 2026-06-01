import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  goAiAssistant,
  goBack,
  goExclusiveItinerary,
  resolveEventDetailIdFromQuery,
  ROUTES,
  warmAiAssistant,
} from '../../../utils/route';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import { DEFER_EVENT_POSTS_MS } from '../../../utils/timing';
import { useNavigationStore } from '../../../stores/navigationStore';
import { pickGlobalFreeMonthly } from '../../../components/profile';
import { useContactUnlockQuota } from '../../../hooks/useContactUnlockQuota';
import {
  useActivityDetailQuery,
  useCurrentUserQuery,
  useProfileEntitlementsQuery,
} from '../../../hooks/useSyncApi';
import type { PackageTierId } from '../../../types/backend';
import { resolveProfileEntitlement } from '../../../utils/profileEntitlement';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { isApiEnabled } from '../../../constants/api';
import { isAiShortcutTag, recordAiShortcutTagUse } from '../../../utils/aiShortcutTags';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';
import { useEventDetailPosts } from './useEventDetailPosts';
import { useEventDetailLive } from './useEventDetailLive';
import type { EventDetailTabId } from './components/EventDetailContentTabs';
import { stackPageNavChromePx } from '../../../components/navigation/PageNavigation';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import { usePostPageShare } from '../../../hooks/usePostPageShare';
import type { PostSharePayload } from '../../../utils/postShare';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';

export type UseEventDetailPageOptions = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export function useEventDetailPage({ confirm }: UseEventDetailPageOptions) {
  const router = useRouter();
  const navInsets = useNavBarInsets();
  const activeActivityLegacyId = useNavigationStore(
    (state) => state.activeActivityLegacyId,
  );
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const feedReady = useDeferredMount(DEFER_EVENT_POSTS_MS);
  const composerReady = useDeferredMount(0);

  const eventId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );
  const highlightPostId = router.params.postId?.trim() || '';

  useEffect(() => {
    if (Number.isFinite(eventId) && eventId > 0) {
      useNavigationStore.getState().setActiveActivityLegacyId(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    warmAiAssistant();
  }, []);

  const activityQuery = useActivityDetailQuery(eventId);
  const postsQuery = useEventPostsInfiniteQuery(eventId, {
    enabled: feedReady,
    anchorPostId: highlightPostId || undefined,
  });
  const contactUnlockQuota = useContactUnlockQuota(eventId);
  const entitlementsQuery = useProfileEntitlementsQuery(eventId);
  const profileEntitlement = useMemo(
    () => resolveProfileEntitlement(entitlementsQuery.data, eventId),
    [entitlementsQuery.data, eventId],
  );
  const currentPaidTierId = profileEntitlement?.paidTierId ?? null;
  const freeMonthly = useMemo(
    () => pickGlobalFreeMonthly(entitlementsQuery.data),
    [entitlementsQuery.data],
  );
  const currentUserQuery = useCurrentUserQuery();
  const profileUser = useResolvedProfile();
  const apiEnabled = isApiEnabled();

  const [prompt, setPrompt] = useState('');
  const [contentTab, setContentTab] = useState<EventDetailTabId>('posts');
  const [contactUnlockExhaustedOpen, setContactUnlockExhaustedOpen] = useState(false);
  const [packageSheetOpen, setPackageSheetOpen] = useState(false);
  const [packageSheetInitialTierId, setPackageSheetInitialTierId] = useState<
    PackageTierId | undefined
  >(undefined);

  const openContactUnlockExhaustedModal = useCallback(() => {
    setContactUnlockExhaustedOpen(true);
  }, []);

  const closeContactUnlockExhaustedModal = useCallback(() => {
    setContactUnlockExhaustedOpen(false);
  }, []);

  const openPackageUpgradeSheet = useCallback((targetTierId: PackageTierId) => {
    setContactUnlockExhaustedOpen(false);
    setPackageSheetInitialTierId(targetTierId);
    setPackageSheetOpen(true);
  }, []);

  const closePackageUpgradeSheet = useCallback(() => {
    setPackageSheetOpen(false);
    setPackageSheetInitialTierId(undefined);
  }, []);

  const displayUserName = currentUserQuery.data?.name ?? profileUser.name ?? '用户';

  const title = activityQuery.data?.name;
  const activityImage = activityQuery.data?.image;
  const activityDate = activityQuery.data?.date;

  const getDefaultShare = useCallback((): PostSharePayload | null => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      return null;
    }
    return {
      postId: '',
      activityLegacyId: eventId,
      eventTitle: title,
      imageUrl: activityImage,
    };
  }, [activityImage, eventId, title]);

  usePostPageShare({ getDefaultShare });

  const activityStatus = getActivityStatusFromActivity(activityDate, title);
  const hasValidEventId = Number.isFinite(eventId) && eventId > 0;
  const showHeaderSkeleton =
    hasValidEventId &&
    !title &&
    !activityQuery.isError &&
    (activityQuery.isLoading || activityQuery.data === undefined);
  const showActivityMissing =
    hasValidEventId &&
    !title &&
    !activityQuery.isLoading &&
    !showHeaderSkeleton &&
    (activityQuery.isError || activityQuery.data === null);
  const routeContentReady = Boolean(title) || showHeaderSkeleton || showActivityMissing;
  usePageRouteReady(routeContentReady);

  const live = useEventDetailLive({ contentTab, showHeaderSkeleton });

  const handleBack = useCallback(() => {
    goBack(ROUTES.HOME);
  }, []);

  const metaLine = useMemo(() => {
    if (!activityQuery.data) return '';
    const parts = [activityQuery.data.date, activityQuery.data.location].filter(
      Boolean,
    );
    return parts.join(' · ');
  }, [activityQuery.data]);

  const headerChromePx = stackPageNavChromePx(navInsets, {
    meta: Boolean(metaLine),
  });
  const scrollHeight = useTabPageMainHeight(headerChromePx);

  const posts = useEventDetailPosts({
    eventId,
    contentTab,
    postsQuery,
    apiEnabled,
    confirm,
    contactUnlockQuota,
    openContactUnlockExhaustedModal,
    setScrollTop,
  });

  const bumpShortcutTagUsage = useCallback((tag: string) => {
    recordAiShortcutTagUse(tag);
  }, []);

  const handleOpenExclusiveItinerary = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return;
    }
    goExclusiveItinerary(eventId);
  }, [eventId]);

  const openAi = useCallback(
    (message?: string) => {
      const trimmed = message?.trim();
      if (trimmed && isAiShortcutTag(trimmed)) {
        bumpShortcutTagUsage(trimmed);
      }
      setPrompt('');
      goAiAssistant({
        ...(trimmed ? { initialMessage: trimmed } : {}),
        activityLegacyId: Number.isNaN(eventId) ? undefined : eventId,
      });
    },
    [bumpShortcutTagUsage, eventId],
  );

  const handleShortcutTag = useCallback(
    (tag: string) => {
      bumpShortcutTagUsage(tag);
      goAiAssistant({ initialMessage: tag, activityLegacyId: eventId });
    },
    [bumpShortcutTagUsage, eventId],
  );

  const invalidEventId = Number.isNaN(eventId) || eventId <= 0;
  const loadError = activityQuery.isError && !activityQuery.isLoading;
  const postsLoading = !feedReady || postsQuery.isLoading;
  const showPostsEnd =
    contentTab === 'posts' &&
    posts.postItems.length > 0 &&
    !postsLoading &&
    !postsQuery.hasMore &&
    !postsQuery.isLoadingMore;

  return {
    eventId,
    highlightPostId,
    navInsets,
    title,
    metaLine,
    scrollHeight,
    scrollTop,
    activityStatus,
    activityStatusClass: activityStatusCardClass(activityStatus),
    showHeaderSkeleton,
    invalidEventId,
    loadError,
    showActivityMissing,
    onRetryActivity: () => void activityQuery.refetch(),
    composerReady,
    prompt,
    setPrompt,
    contentTab,
    setContentTab,
    live,
    posts,
    postsLoading,
    showPostsEnd,
    apiEnabled,
    currentUserAvatar: currentUserQuery.data?.avatar,
    postsQuery,
    handleBack,
    openAi,
    handleShortcutTag,
    handleOpenExclusiveItinerary,
    displayUserName,
    entitlements: {
      eventId,
      contactUnlockExhaustedOpen,
      closeContactUnlockExhaustedModal,
      openPackageUpgradeSheet,
      currentPaidTierId,
      freeMonthly,
      packageSheetOpen,
      packageSheetInitialTierId,
      closePackageUpgradeSheet,
    },
  };
}
