import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { updatePostRecruit } from '../../../api/sync/posts';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { requireAuth } from '../../../utils/authGate';
import { deletePostWithFeedback } from '../../../utils/deletePostFeedback';
import {
  scrollElementToCenter,
  scrollElementToReveal,
} from '../../../utils/scrollToCenter';
import { postCommentComposerId } from '../../../components/post/postCommentComposerId';
import type { EventDetailPost } from '@/types/partner';
import type { BuddyPostComposeCandidate } from '@/types/partner';
import type { RecruitApplyComposeResult } from './useRecruitApplyCompose';
import {
  EVENT_POST_ESTIMATED_HEIGHT_PX,
  EVENT_POSTS_INITIAL_RENDER,
  EVENT_POSTS_MAX_MOUNTED,
  EVENT_POSTS_RENDER_STEP,
  EVENT_POSTS_SLIDE_BUFFER,
  EVENT_POSTS_PREFETCH_AHEAD,
} from '../../../constants/listPerf';
import { useWindowedList } from '../../../hooks/useWindowedList';
import {
  normalizeEventPostList,
  type EventPostListItem,
} from '../utils/eventPostNormalize';
import { useEventDetailPostSearch } from './useEventDetailPostSearch';
import { useEventDetailPostFilters } from './useEventDetailPostFilters';
import { filterEventDetailPostsByRules } from '../utils/filterEventDetailPostsByRules';
import { resolveBuddyPostRecruitDisplay } from '../utils/parseBuddyPostRecruitDisplay';
import { resolvePersonalityMediaUrls } from '@/domains/personality-test/utils/resolvePersonalityMedia';
import { useBuddyMatchProfile } from '../../../hooks/useBuddyMatchProfile';
import { sortEventDetailPostsByPreference } from '../utils/buddyPostPreferenceMatch';
import { t } from '@/i18n/translate';
import { showAppToast } from '@/utils/appToast';

export type OpenPostCommentsOptions = {
  draft?: string;
};

export const EVENT_DETAIL_SCROLL_ID = 'event-detail-scroll';

const TAB_BAR_SCROLL_INSET_PX = 72;
const COMPOSER_KEYBOARD_PADDING_PX = 16;

function resolveComposerBottomInset(keyboardHeight?: number): number {
  if (keyboardHeight != null && keyboardHeight > 0) {
    return keyboardHeight + COMPOSER_KEYBOARD_PADDING_PX;
  }
  return TAB_BAR_SCROLL_INSET_PX;
}

type EventPostsQuery = ReturnType<typeof useEventPostsInfiniteQuery>;

export type UseEventDetailPostsParams = {
  activityLegacyId?: number;
  postsQuery: EventPostsQuery;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  setScrollTop: (value: number | undefined) => void;
  highlightPostId?: string;
  openCommentsOnMount?: boolean;
  onTravelGuidePrefillDismiss?: (activityLegacyId: number, guideId: string) => void;
  composeApplyJoin?: (
    post: EventDetailPost,
  ) => Promise<RecruitApplyComposeResult | null>;
  buildFallbackApplyDraft?: (post: EventDetailPost) => string;
};

export function useEventDetailPosts({
  activityLegacyId,
  postsQuery,
  confirm,
  setScrollTop,
  highlightPostId = '',
  openCommentsOnMount = false,
  onTravelGuidePrefillDismiss,
  composeApplyJoin,
  buildFallbackApplyDraft,
}: UseEventDetailPostsParams) {
  const { profile: matchProfile } = useBuddyMatchProfile();
  const [expandedCommentPostIds, setExpandedCommentPostIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [applyJoinHintPostIds, setApplyJoinHintPostIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [commentDraftByPostId, setCommentDraftByPostId] = useState<
    Record<string, string>
  >({});
  const [applyComposeLoadingByPostId, setApplyComposeLoadingByPostId] = useState<
    Record<string, boolean>
  >({});
  const [applyComposeCandidatesByPostId, setApplyComposeCandidatesByPostId] = useState<
    Record<string, BuddyPostComposeCandidate[]>
  >({});
  const [applyComposeDisclaimerByPostId, setApplyComposeDisclaimerByPostId] = useState<
    Record<string, string | null>
  >({});
  const autoOpenedCommentsRef = useRef<string | null>(null);

  const postFilters = useEventDetailPostFilters(postsQuery.items);

  const ruleFilteredPosts = useMemo(
    () => filterEventDetailPostsByRules(postsQuery.items, postFilters.filters),
    [postFilters.filters, postsQuery.items],
  );

  const preferenceSortedPosts = useMemo(() => {
    if (!postFilters.preferenceSortEnabled || !matchProfile) {
      return ruleFilteredPosts;
    }
    return sortEventDetailPostsByPreference(ruleFilteredPosts, matchProfile);
  }, [matchProfile, postFilters.preferenceSortEnabled, ruleFilteredPosts]);

  const search = useEventDetailPostSearch({
    activityLegacyId,
    loadedPosts: preferenceSortedPosts,
    ruleFilters: postFilters.filters,
    onTravelGuidePrefillDismiss,
    applyPreferenceRank: postFilters.preferenceSortEnabled,
  });

  const loadedPostItems = useMemo((): EventPostListItem[] => {
    const source = search.isActive
      ? (search.matchedPosts ?? [])
      : preferenceSortedPosts;
    return normalizeEventPostList(source);
  }, [preferenceSortedPosts, search.isActive, search.matchedPosts]);

  const {
    visibleItems: postItems,
    windowStart,
    windowEnd,
    loadedEnd,
    hiddenCount,
    hasMoreToShow: hasMoreVisiblePosts,
    showMore: showMoreVisiblePosts,
    ensureIndexVisible,
    setScrollFocalIndex,
    resetWindow,
  } = useWindowedList(loadedPostItems, {
    initialSize: EVENT_POSTS_INITIAL_RENDER,
    step: EVENT_POSTS_RENDER_STEP,
    maxVisible: EVENT_POSTS_MAX_MOUNTED,
    slidingWindow: true,
    slideBuffer: EVENT_POSTS_SLIDE_BUFFER,
  });

  useEffect(() => {
    resetWindow();
  }, [
    search.isActive,
    postFilters.isActive,
    postFilters.preferenceSortEnabled,
    resetWindow,
  ]);

  useEffect(() => {
    const avatarKeys = loadedPostItems
      .map((item) => item.post.avatar?.trim())
      .filter((avatar): avatar is string => Boolean(avatar?.startsWith('avatar/')));
    if (!avatarKeys.length) return;
    void resolvePersonalityMediaUrls(avatarKeys);
  }, [loadedPostItems]);

  const visiblePostIds = useMemo(
    () => new Set(postItems.map((item) => item.post.id)),
    [postItems],
  );

  useEffect(() => {
    const highlight = highlightPostId.trim();
    setExpandedCommentPostIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (visiblePostIds.has(id) || id === highlight) {
          next.add(id);
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [visiblePostIds, highlightPostId]);

  const loadMorePosts = useCallback(() => {
    if (search.isActive || postFilters.isActive) {
      return;
    }
    if (loadedEnd < loadedPostItems.length) {
      showMoreVisiblePosts();
      return;
    }
    void postsQuery.loadMore();
  }, [
    loadedEnd,
    loadedPostItems.length,
    postFilters.isActive,
    search.isActive,
    showMoreVisiblePosts,
    postsQuery,
  ]);

  const handleListScroll = useCallback(
    (scrollTop: number) => {
      const index = Math.floor(scrollTop / EVENT_POST_ESTIMATED_HEIGHT_PX);
      setScrollFocalIndex(index);

      if (search.isActive || postFilters.isActive) {
        return;
      }
      if (
        loadedEnd < loadedPostItems.length &&
        index >= Math.max(0, loadedEnd - EVENT_POSTS_PREFETCH_AHEAD)
      ) {
        showMoreVisiblePosts();
      }
    },
    [
      loadedEnd,
      loadedPostItems.length,
      postFilters.isActive,
      search.isActive,
      setScrollFocalIndex,
      showMoreVisiblePosts,
    ],
  );

  const handleScrollToLower = loadMorePosts;

  const scrollToElement = useCallback(
    (elementId: string) => {
      const postId = elementId.startsWith('post-')
        ? elementId.slice('post-'.length)
        : elementId;
      const index = loadedPostItems.findIndex((item) => item.post.id === postId);
      if (index >= 0) ensureIndexVisible(index);

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
    },
    [loadedPostItems, ensureIndexVisible, setScrollTop],
  );

  const ensureComposerVisible = useCallback(
    (postId: string, keyboardHeight?: number) => {
      const bottomInset = resolveComposerBottomInset(keyboardHeight);
      const targetSelector = `#${postCommentComposerId(postId)}`;
      const scrollViewSelector = `#${EVENT_DETAIL_SCROLL_ID}`;

      void scrollElementToReveal(
        scrollViewSelector,
        targetSelector,
        setScrollTop,
        bottomInset,
      ).then((revealed) => {
        if (!revealed) {
          setTimeout(() => {
            void scrollElementToReveal(
              scrollViewSelector,
              targetSelector,
              setScrollTop,
              bottomInset,
            );
          }, 150);
        }
      });
    },
    [setScrollTop],
  );

  const handleDeletePost = useCallback(
    async (post: EventDetailPost) => {
      const ok = await confirm({
        title: t('eventDetail.deleteConfirmTitle'),
        message: t('eventDetail.deleteConfirmMessage'),
        confirmText: t('eventDetail.deleteConfirmText'),
      });
      if (!ok) return;

      requireAuth(() => {
        void deletePostWithFeedback(post.id, {
          onRemoved: () => postsQuery.removeItem(post.id),
          refetchOnFailure: () => postsQuery.refetch({ silent: true }),
        });
      }, 'social');
    },
    [confirm, postsQuery],
  );

  const handleRecruitStatusToggle = useCallback(
    (post: EventDetailPost) => {
      requireAuth(() => {
        void (async () => {
          const recruitDisplay = resolveBuddyPostRecruitDisplay(post);
          const isFull = recruitDisplay.recruitStatus === 'full';
          const nextStatus = isFull ? 'open' : 'full';

          try {
            const updated = await updatePostRecruit(post.id, {
              recruitStatus: nextStatus,
              ...(nextStatus === 'full' && recruitDisplay.slotsTotal != null
                ? {
                    slotsTotal: recruitDisplay.slotsTotal,
                    slotsFilled:
                      recruitDisplay.slotsFilled ?? recruitDisplay.slotsTotal,
                  }
                : {}),
            });
            postsQuery.patchItem(updated);
            showAppToast(
              nextStatus === 'full'
                ? 'eventDetail.recruitMarkedFull'
                : 'eventDetail.recruitReopened',
              { icon: 'success' },
            );
          } catch (error) {
            const message =
              error instanceof Error && error.message.trim()
                ? error.message.trim()
                : t('eventDetail.recruitStatusToggleFailed');
            showAppToast(message, { raw: true, icon: 'none' });
          }
        })();
      }, 'social');
    },
    [postsQuery],
  );

  const handleRecruitSlotsAdjust = useCallback(
    (post: EventDetailPost, delta: -1 | 1) => {
      requireAuth(() => {
        void (async () => {
          const recruitDisplay = resolveBuddyPostRecruitDisplay(post);
          const slotsTotal = recruitDisplay.slotsTotal;
          if (slotsTotal == null || slotsTotal <= 0) {
            return;
          }

          const currentFilled = Math.min(
            Math.max(recruitDisplay.slotsFilled ?? 1, 1),
            slotsTotal,
          );
          const nextFilled = Math.min(slotsTotal, Math.max(1, currentFilled + delta));
          if (nextFilled === currentFilled) {
            return;
          }

          try {
            const updated = await updatePostRecruit(post.id, {
              recruitStatus:
                recruitDisplay.recruitStatus === 'full'
                  ? 'open'
                  : recruitDisplay.recruitStatus,
              slotsTotal,
              slotsFilled: nextFilled,
            });
            postsQuery.patchItem(updated);
          } catch (error) {
            const message =
              error instanceof Error && error.message.trim()
                ? error.message.trim()
                : t('eventDetail.recruitSlotsAdjustFailed');
            showAppToast(message, { raw: true, icon: 'none' });
          }
        })();
      }, 'social');
    },
    [postsQuery],
  );

  const openPostComments = useCallback(
    (postId: string, options?: OpenPostCommentsOptions) => {
      const index = loadedPostItems.findIndex((item) => item.post.id === postId);
      if (index >= 0) ensureIndexVisible(index);

      const draft = options?.draft?.trim();
      if (draft) {
        setCommentDraftByPostId((prev) => ({ ...prev, [postId]: draft }));
      }

      setExpandedCommentPostIds((prev) => {
        if (prev.has(postId)) return prev;
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
    },
    [loadedPostItems, ensureIndexVisible],
  );

  const closePostComments = useCallback((postId: string) => {
    setExpandedCommentPostIds((prev) => {
      if (!prev.has(postId)) return prev;
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    setApplyJoinHintPostIds((prev) => {
      if (!prev.has(postId)) return prev;
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    setCommentDraftByPostId((prev) => {
      if (!(postId in prev)) return prev;
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setApplyComposeLoadingByPostId((prev) => {
      if (!(postId in prev)) return prev;
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setApplyComposeCandidatesByPostId((prev) => {
      if (!(postId in prev)) return prev;
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setApplyComposeDisclaimerByPostId((prev) => {
      if (!(postId in prev)) return prev;
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  }, []);

  const openApplyJoinComments = useCallback(
    (postId: string) => {
      requireAuth(() => {
        const post = loadedPostItems.find((item) => item.post.id === postId)?.post;
        if (!post) {
          openPostComments(postId);
          return;
        }

        openPostComments(postId);
        setApplyJoinHintPostIds((prev) => new Set(prev).add(postId));
        setApplyComposeLoadingByPostId((prev) => ({ ...prev, [postId]: true }));

        void (async () => {
          let draft = buildFallbackApplyDraft?.(post)?.trim() ?? '';
          try {
            const composed = composeApplyJoin ? await composeApplyJoin(post) : null;
            if (composed?.candidates?.length) {
              setApplyComposeCandidatesByPostId((prev) => ({
                ...prev,
                [postId]: composed.candidates,
              }));
              setApplyComposeDisclaimerByPostId((prev) => ({
                ...prev,
                [postId]: composed.disclaimer,
              }));
              draft = composed.candidates[0]?.text?.trim() || draft;
            }
          } catch {
            // fallback draft below
          }

          if (draft) {
            setCommentDraftByPostId((prev) => ({ ...prev, [postId]: draft }));
          }
          setApplyComposeLoadingByPostId((prev) => ({ ...prev, [postId]: false }));
        })();
      }, 'social');
    },
    [buildFallbackApplyDraft, composeApplyJoin, loadedPostItems, openPostComments],
  );

  const selectApplyCandidate = useCallback((postId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setCommentDraftByPostId((prev) => ({ ...prev, [postId]: trimmed }));
  }, []);

  const getShowApplyJoinHint = useCallback(
    (postId: string) => applyJoinHintPostIds.has(postId),
    [applyJoinHintPostIds],
  );

  const getCommentDraft = useCallback(
    (postId: string) => commentDraftByPostId[postId],
    [commentDraftByPostId],
  );

  useEffect(() => {
    const postId = highlightPostId.trim();
    if (!openCommentsOnMount || !postId) return;
    if (autoOpenedCommentsRef.current === postId) return;
    if (!loadedPostItems.some((item) => item.post.id === postId)) return;

    autoOpenedCommentsRef.current = postId;
    openPostComments(postId);
  }, [highlightPostId, loadedPostItems, openCommentsOnMount, openPostComments]);

  const handleCommentSubmitted = useCallback(
    (updated: Pick<EventDetailPost, 'id' | 'comments'>) => {
      setCommentDraftByPostId((prev) => {
        if (!(updated.id in prev)) return prev;
        const next = { ...prev };
        delete next[updated.id];
        return next;
      });
      setApplyJoinHintPostIds((prev) => {
        if (!prev.has(updated.id)) return prev;
        const next = new Set(prev);
        next.delete(updated.id);
        return next;
      });
      postsQuery.patchItem(updated);
    },
    [postsQuery],
  );

  return {
    postItems,
    totalPostCount: loadedPostItems.length,
    hiddenPostCount: hiddenCount,
    windowStart,
    windowEnd,
    hasMoreVisiblePosts:
      search.isActive || postFilters.isActive ? false : hasMoreVisiblePosts,
    expandedCommentPostIds,
    handleListScroll,
    handleScrollToLower,
    scrollToElement,
    ensureComposerVisible,
    handleDeletePost,
    handleRecruitStatusToggle,
    handleRecruitSlotsAdjust,
    openPostComments,
    closePostComments,
    openApplyJoinComments,
    getCommentDraft,
    getShowApplyJoinHint,
    getApplyComposeLoading: (postId: string) =>
      Boolean(applyComposeLoadingByPostId[postId]),
    getApplyComposeCandidates: (postId: string) =>
      applyComposeCandidatesByPostId[postId],
    getApplyComposeDisclaimer: (postId: string) =>
      applyComposeDisclaimerByPostId[postId] ?? null,
    selectApplyCandidate,
    commentDraftByPostId,
    handleCommentSubmitted,
    searchQuery: search.query,
    setSearchQuery: search.setQuery,
    applyTravelGuideSearchPrefill: search.applyTravelGuidePrefill,
    applySearchPrefill: search.applySearchPrefill,
    clearSearchQuery: search.clearSearch,
    searchActive: search.isActive,
    searchLoading: search.isSearching,
    searchMatchedCount: search.matchedCount,
    searchUsedLocalFallback: search.usedLocalFallback,
    searchParsed: search.searchParsed,
    searchSceneParsedInsight: search.sceneParsedInsight,
    searchScenePreferenceInsight: search.scenePreferenceInsight,
    travelGuideSearchPrefillHint: search.travelGuidePrefillHint,
    postFilterCityOptions: postFilters.cityOptions,
    postFilterSelectedCity: postFilters.selectedCity,
    setPostFilterSelectedCity: postFilters.setSelectedCity,
    postFilterRecruitingOnly: postFilters.recruitingOnly,
    setPostFilterRecruitingOnly: postFilters.setRecruitingOnly,
    postFiltersActive: postFilters.isActive,
    clearPostFilters: postFilters.clearFilters,
    postFilterPreferenceSortEnabled: postFilters.preferenceSortEnabled,
    setPostFilterPreferenceSortEnabled: postFilters.setPreferenceSortEnabled,
  };
}
