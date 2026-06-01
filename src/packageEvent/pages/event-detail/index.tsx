import './event-detail.scss';
import Taro, { useRouter } from '@tarojs/taro';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Map } from 'lucide-react-taro';
import {
  goAiAssistant,
  goBack,
  goEventMap,
  goExclusiveItinerary,
  resolveEventDetailIdFromQuery,
  ROUTES,
  warmAiAssistant,
} from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { BottomNavSlot } from '../../../components/BottomNav';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import { DEFER_EVENT_POSTS_MS } from '../../../utils/timing';
import { useNavigationStore } from '../../../stores/navigationStore';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import { EventDetailComposerSection } from './components/EventDetailComposerSection';
import { EventDetailEntitlementModals } from './components/EventDetailEntitlementModals';
import { pickGlobalFreeMonthly } from '../../../components/profile';
import { useContactUnlockQuota } from '../../../hooks/useContactUnlockQuota';
import {
  applyToPostAndInvalidate,
  deletePostAndInvalidate,
  likePostAndInvalidate,
  updatePostAndInvalidate,
  useActivityDetailQuery,
  useCurrentUserQuery,
  useProfileEntitlementsQuery,
} from '../../../hooks/useSyncApi';
import type { PackageTierId } from '../../../types/backend';
import { resolveProfileEntitlement } from '../../../utils/profileEntitlement';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { consumeContactUnlockWithQuota } from '../../../utils/contactUnlockEntitlement';
import { isApiEnabled } from '../../../constants/api';
import { requireAuth } from '../../../utils/authGate';
import type { EventDetailPost } from '../../../types/backend';
import { isAiShortcutTag, recordAiShortcutTagUse } from '../../../utils/aiShortcutTags';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';
import { formatPostPublishTime } from '../../../utils/formatPostPublishTime';
import { sanitizeImageList, sanitizeRemoteImageUrl } from '../../../utils/imageUrl';
import { EventPostsVirtualList } from './components/EventPostsVirtualList';
import type { EventDetailTabId } from './components/EventDetailContentTabs';
import { MOCK_LIVE_INFO_FEED } from './liveInfoMock';
import PageNavigation, {
  stackPageNavChromePx,
} from '../../../components/PageNavigation';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { scrollElementToCenter } from '../../../utils/scrollToCenter';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import { usePostPageShare } from '../../../hooks/usePostPageShare';
import type { PostSharePayload } from '../../../utils/postShare';
import { Button } from '../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';
import { EventLiveInfoUpdateSheet } from './components/EventLiveInfoUpdateSheet';
import type { EventLiveInfoTabActions } from './live/EventLiveInfoTab';
import type { PublishLiveInfoPayload } from './useEventLiveInfo';

const EVENT_DETAIL_SCROLL_ID = 'event-detail-scroll';

const EventLiveInfoTab = lazy(() =>
  import('./live/EventLiveInfoTab').then((mod) => ({
    default: mod.EventLiveInfoTab,
  })),
);

const EventDetailPage = () => {
  useEndRouteTransitionOnShow();
  const router = useRouter();
  const navInsets = useNavBarInsets();
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const activeActivityLegacyId = useNavigationStore(
    (state) => state.activeActivityLegacyId,
  );
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
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });
  const [prompt, setPrompt] = useState('');
  const [appliedPostIds, setAppliedPostIds] = useState<Set<string>>(() => new Set());
  const [expandedCommentPostIds, setExpandedCommentPostIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [contentTab, setContentTab] = useState<EventDetailTabId>('posts');
  const [liveFeedCount, setLiveFeedCount] = useState(MOCK_LIVE_INFO_FEED.length);
  const [liveUpdateSheetOpen, setLiveUpdateSheetOpen] = useState(false);
  const [contactUnlockExhaustedOpen, setContactUnlockExhaustedOpen] = useState(false);
  const [packageSheetOpen, setPackageSheetOpen] = useState(false);
  const [packageSheetInitialTierId, setPackageSheetInitialTierId] = useState<
    PackageTierId | undefined
  >(undefined);
  const liveInfoActionsRef = useRef<EventLiveInfoTabActions | null>(null);

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

  const handleLiveFeedCountChange = useCallback((count: number) => {
    setLiveFeedCount(count);
  }, []);

  const handleLiveInfoActions = useCallback(
    (actions: EventLiveInfoTabActions | null) => {
      liveInfoActionsRef.current = actions;
    },
    [],
  );

  const handleOpenLiveUpdateSheet = useCallback(() => {
    setLiveUpdateSheetOpen(true);
  }, []);

  const handleCloseLiveUpdateSheet = useCallback(() => {
    setLiveUpdateSheetOpen(false);
  }, []);

  const handleLiveUpdatePublish = useCallback(
    async (payload: PublishLiveInfoPayload): Promise<boolean> => {
      const actions = liveInfoActionsRef.current;
      if (!actions) {
        void Taro.showToast({ title: '请稍候再试', icon: 'none' });
        return false;
      }
      return actions.publishUpdate(payload);
    },
    [],
  );

  useEffect(() => {
    if (contentTab !== 'live') {
      setLiveUpdateSheetOpen(false);
    }
  }, [contentTab]);

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

  const postItems = useMemo(() => {
    return postsQuery.items.map((item) => {
      const post: EventDetailPost = {
        id: item.id,
        userId: item.userId,
        location: item.location,
        time: item.time,
        createdAt: item.createdAt,
        body: item.body ?? '',
        tags: item.tags ?? [],
        name: item.name?.trim() || '用户',
        likes: item.likes,
        liked: item.liked,
        comments: item.comments,
        avatar: sanitizeRemoteImageUrl(item.avatar) ?? item.avatar,
        status: item.status,
        contentTypes: item.contentTypes,
        images: sanitizeImageList(item.images),
      };
      const publishTimeLabel = post.createdAt
        ? formatPostPublishTime(post.createdAt)
        : post.time;
      return { post, publishTimeLabel };
    });
  }, [postsQuery.items]);

  const handleScrollToLower = useCallback(() => {
    if (contentTab !== 'posts') return;
    void postsQuery.loadMore();
  }, [contentTab, postsQuery]);

  const handleApply = useCallback(
    (postId: string) => {
      if (appliedPostIds.has(postId)) return;

      if (contactUnlockQuota.exhausted) {
        openContactUnlockExhaustedModal();
        return;
      }

      const runApply = () => {
      void applyToPostAndInvalidate(postId)
        .then(async (result) => {
          if (!result.alreadyApplied) {
            const consumed = await consumeContactUnlockWithQuota(eventId);
            if (!consumed) {
              openContactUnlockExhaustedModal();
              return;
            }
          }

          setAppliedPostIds((prev) => new Set(prev).add(postId));
          const toastTitle = result.alreadyApplied ? '已申请' : '申请成功';
          void Taro.showToast({ title: toastTitle, icon: 'success' });
        })
        .catch(() => void Taro.showToast({ title: '申请失败', icon: 'none' }));
      };

      requireAuth(runApply, 'post');
    },
    [
      appliedPostIds,
      contactUnlockQuota.exhausted,
      eventId,
      openContactUnlockExhaustedModal,
    ],
  );

  const handleLikePost = useCallback(
    (postId: string) => {
      requireAuth(() => {
        if (!apiEnabled) return;
        void likePostAndInvalidate(postId)
          .then((updated) => {
            postsQuery.patchItem(updated);
          })
          .catch(
            () => void Taro.showToast({ title: '请求失败，请稍后重试', icon: 'none' }),
          );
      }, 'social');
    },
    [apiEnabled, postsQuery],
  );

  const scrollToElement = useCallback((elementId: string) => {
    const targetSelector = `#${elementId}`;
    void scrollElementToCenter(
      `#${EVENT_DETAIL_SCROLL_ID}`,
      targetSelector,
      setScrollTop,
    ).then((centered) => {
      if (!centered) {
        setScrollTop(undefined);
        setTimeout(() => {
          void scrollElementToCenter(
            `#${EVENT_DETAIL_SCROLL_ID}`,
            targetSelector,
            setScrollTop,
          );
        }, 150);
      }
    });
  }, []);

  const togglePostComments = useCallback((postId: string) => {
    setExpandedCommentPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  const handleDeletePost = useCallback(
    async (post: EventDetailPost) => {
      const ok = await confirm({
        title: '确认删除',
        message: '删除后无法恢复，确定要删除这条帖子吗？',
        confirmText: '删除',
      });
      if (!ok) return;
      if (!apiEnabled) {
        void Taro.showToast({ title: '已删除', icon: 'success' });
        return;
      }
      void deletePostAndInvalidate(post.id)
        .then(() => {
          postsQuery.removeItem(post.id);
          void Taro.showToast({ title: '已删除', icon: 'success' });
        })
        .catch(() => {
          void postsQuery.refetch();
          void Taro.showToast({ title: '删除失败', icon: 'none' });
        });
    },
    [apiEnabled, confirm, postsQuery],
  );

  const handleCommentSubmitted = useCallback(() => {
    // commentPostAndInvalidate patches post list cache; no full refetch.
  }, []);

  const handleCompletePost = useCallback(
    async (postId: string) => {
      const ok = await confirm({
        title: '确认标记为已组队',
        message: '标记后该帖子将结束招募，同类型帖子可重新发布。确定要继续吗？',
        confirmText: '确认',
      });
      if (!ok) return;
      if (!apiEnabled) {
        void Taro.showToast({ title: '已标记为已组队', icon: 'success' });
        return;
      }
      void updatePostAndInvalidate(postId, { status: 'completed' })
        .then((updated) => {
          postsQuery.patchItem({ id: postId, status: updated.status });
          void Taro.showToast({ title: '已标记为已组队', icon: 'success' });
        })
        .catch(() => {
          void Taro.showToast({ title: '标记失败', icon: 'none' });
        });
    },
    [apiEnabled, confirm, postsQuery],
  );

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

  if (Number.isNaN(eventId) || eventId <= 0) {
    return (
      <View className="s-event-detail s-page-with-tabbar">
        <View className="s-event-detail__fallback">活动不存在</View>
        <BottomNavSlot />
      </View>
    );
  }

  if (activityQuery.isError && !activityQuery.isLoading) {
    return (
      <View className="s-event-detail s-page-with-tabbar">
        <View className="s-event-detail__fallback">
          <Text>活动信息加载失败</Text>
          <Button
            className="s-event-detail__retry"
            onClick={() => void activityQuery.refetch()}
          >
            <Text className="s-btn-label">重试</Text>
          </Button>
        </View>
        <BottomNavSlot />
      </View>
    );
  }

  if (showActivityMissing) {
    return (
      <View className="s-event-detail s-page-with-tabbar">
        <View className="s-event-detail__fallback">活动不存在</View>
        <BottomNavSlot />
      </View>
    );
  }

  const postsLoading = !feedReady || postsQuery.isLoading;
  const showPostsEnd =
    contentTab === 'posts' &&
    postItems.length > 0 &&
    !postsLoading &&
    !postsQuery.hasMore &&
    !postsQuery.isLoadingMore;
  const showLiveEnd = contentTab === 'live' && !showHeaderSkeleton && liveFeedCount > 0;

  return (
    <View
      data-cmp="EventDetail"
      className={[
        's-event-detail',
        's-page-with-tabbar',
        activityStatusCardClass(activityStatus),
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-page-with-tabbar__main s-event-detail__shell">
        <PageNavigation
          title={title ?? ''}
          meta={metaLine || undefined}
          onBack={handleBack}
          trailing={
            <Button
              className="s-page-nav__icon-action s-page-nav__icon-action--map"
              aria-label="地图"
              hoverClass="s-page-nav__icon-action--pressed"
              onClick={() => {
                if (Number.isFinite(eventId) && eventId > 0) {
                  goEventMap(eventId, { title: title ?? undefined });
                } else {
                  goEventMap(0, { title: title ?? undefined });
                }
              }}
            >
              <Map size={26} />
            </Button>
          }
        />

        <ScrollView
          id={EVENT_DETAIL_SCROLL_ID}
          scrollY
          enhanced
          showScrollbar={false}
          scrollTop={scrollTop}
          scrollWithAnimation
          lowerThreshold={80}
          onScrollToLower={handleScrollToLower}
          className="s-event-detail__main s-scrollbar-none"
          style={scrollHeight != null ? { height: `${scrollHeight}px` } : undefined}
        >
          <View className="s-event-detail__scroll-inner">
            <EventDetailComposerSection
              showHeaderSkeleton={showHeaderSkeleton}
              composerReady={composerReady}
              prompt={prompt}
              onPromptChange={setPrompt}
              onAiSubmit={() => openAi(prompt)}
              onShortcutTag={handleShortcutTag}
              onOpenExclusiveItinerary={handleOpenExclusiveItinerary}
              contentTab={contentTab}
              onContentTabChange={setContentTab}
              postsCount={postItems.length}
              liveCount={liveFeedCount}
            />

            {!showHeaderSkeleton && contentTab === 'posts' ? (
              <View className="s-event-detail__posts">
                {postsLoading ? (
                  <ThemedPageLoader variant="skeleton-event-posts" minHeight={200} />
                ) : postItems.length === 0 ? (
                  <Text className="s-event-detail__empty">
                    暂无组队帖，来发布第一条吧
                  </Text>
                ) : (
                  <EventPostsVirtualList
                    activityLegacyId={eventId}
                    onScrollToPostId={scrollToElement}
                    items={postItems}
                    highlightPostId={highlightPostId}
                    expandedCommentPostIds={expandedCommentPostIds}
                    appliedPostIds={appliedPostIds}
                    apiEnabled={apiEnabled}
                    currentUserAvatar={currentUserQuery.data?.avatar}
                    hasMore={postsQuery.hasMore}
                    isLoadingMore={postsQuery.isLoadingMore}
                    onLike={handleLikePost}
                    onToggleComments={togglePostComments}
                    onDelete={handleDeletePost}
                    onApply={handleApply}
                    onComplete={handleCompletePost}
                    onCommentSubmitted={handleCommentSubmitted}
                  />
                )}
              </View>
            ) : null}

            {!showHeaderSkeleton && contentTab === 'live' ? (
              <Suspense
                fallback={
                  <ThemedPageLoader variant="skeleton-live-feed" minHeight={200} />
                }
              >
                <EventLiveInfoTab
                  eventId={eventId}
                  userName={displayUserName}
                  onFeedCountChange={handleLiveFeedCountChange}
                  onOpenUpdate={handleOpenLiveUpdateSheet}
                  onLiveInfoActions={handleLiveInfoActions}
                />
              </Suspense>
            ) : null}

            {!showHeaderSkeleton && showPostsEnd ? (
              <Text className="s-event-detail__end">已经到底啦 ~</Text>
            ) : null}
            {!showHeaderSkeleton && showLiveEnd ? (
              <Text className="s-event-detail__end">已经到底啦 ~</Text>
            ) : null}
          </View>
        </ScrollView>
      </View>
      {confirmDialog}
      <LoginInterceptHost />
      <EventDetailEntitlementModals
        eventId={eventId}
        contactUnlockExhaustedOpen={contactUnlockExhaustedOpen}
        onCloseContactUnlockExhausted={closeContactUnlockExhaustedModal}
        onUpgradeFromContactUnlock={openPackageUpgradeSheet}
        currentPaidTierId={currentPaidTierId}
        freeMonthly={freeMonthly}
        packageSheetOpen={packageSheetOpen}
        packageSheetInitialTierId={packageSheetInitialTierId}
        onClosePackageSheet={closePackageUpgradeSheet}
      />
      {contentTab === 'live' && liveUpdateSheetOpen ? (
        <EventLiveInfoUpdateSheet
          open
          onClose={handleCloseLiveUpdateSheet}
          onPublish={handleLiveUpdatePublish}
        />
      ) : null}
      <BottomNavSlot />
    </View>
  );
};

export default EventDetailPage;
