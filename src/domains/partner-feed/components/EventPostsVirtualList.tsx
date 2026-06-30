import { useEffect, useRef } from 'react';
import type { BuddyPostComposeCandidate } from '@/types/partner';
import type { EventPostListItem } from '../utils/eventPostNormalize';
import { EventPostCard, type EventPostCardProps } from './EventPostCard';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type { EventPostListItem };

type EventPostsVirtualListProps = {
  onScrollToPostId?: (elementId: string) => void;
  items: EventPostListItem[];
  highlightPostId: string;
  expandedCommentPostIds: Set<string>;
  currentUserAvatar?: string;
  getCommentDraft: (postId: string) => string | undefined;
  getShowApplyJoinHint: (postId: string) => boolean;
  getApplyComposeLoading: (postId: string) => boolean;
  getApplyComposeCandidates: (
    postId: string,
  ) => BuddyPostComposeCandidate[] | undefined;
  getApplyComposeDisclaimer: (postId: string) => string | null;
  onSelectApplyCandidate: (postId: string, text: string) => void;
  onOpenComments: (postId: string) => void;
  onApplyJoin: (postId: string) => void;
  onCloseComments: (postId: string) => void;
  onComposerFocus?: (postId: string, keyboardHeight?: number) => void;
  onCommentSubmitted?: EventPostCardProps['onCommentSubmitted'];
  onDelete?: EventPostCardProps['onDelete'];
  onEdit?: EventPostCardProps['onEdit'];
  onRecruitStatusToggle?: EventPostCardProps['onRecruitStatusToggle'];
  onRecruitSlotsAdjust?: EventPostCardProps['onRecruitSlotsAdjust'];
  isLoadingMore?: boolean;
};

export function EventPostsVirtualList({
  onScrollToPostId,
  items,
  highlightPostId,
  expandedCommentPostIds,
  currentUserAvatar,
  getCommentDraft,
  getShowApplyJoinHint,
  getApplyComposeLoading,
  getApplyComposeCandidates,
  getApplyComposeDisclaimer,
  onSelectApplyCandidate,
  onOpenComments,
  onApplyJoin,
  onCloseComments,
  onComposerFocus,
  onCommentSubmitted,
  onDelete,
  onEdit,
  onRecruitStatusToggle,
  onRecruitSlotsAdjust,
  isLoadingMore = false,
}: EventPostsVirtualListProps) {
  const t = useT();
  const highlightScrolledRef = useRef<string | null>(null);

  useEffect(() => {
    highlightScrolledRef.current = null;
  }, [highlightPostId]);

  useEffect(() => {
    if (!highlightPostId) return;
    if (highlightScrolledRef.current === highlightPostId) return;
    if (!items.some((item) => item.post.id === highlightPostId)) return;

    highlightScrolledRef.current = highlightPostId;
    const elId = `post-${highlightPostId}`;
    const scrollTimer = setTimeout(() => onScrollToPostId?.(elId), 280);
    const retryTimer = setTimeout(() => onScrollToPostId?.(elId), 700);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(retryTimer);
    };
  }, [highlightPostId, items, onScrollToPostId]);

  return (
    <View className="s-event-posts-list">
      {items.map((item) => {
        const highlighted = item.post.id === highlightPostId;
        const commentsExpanded = expandedCommentPostIds.has(item.post.id);
        const postId = item.post.id;
        return (
          <View
            key={item.post.id}
            id={`post-${item.post.id}`}
            className="s-event-posts-list__item"
          >
            <EventPostCard
              post={item.post}
              publishTimeLabel={item.publishTimeLabel}
              highlighted={highlighted}
              commentsExpanded={commentsExpanded}
              currentUserAvatar={currentUserAvatar}
              commentDraft={getCommentDraft(postId)}
              showApplyJoinHint={getShowApplyJoinHint(postId)}
              applyComposeLoading={getApplyComposeLoading(postId)}
              applyComposeCandidates={getApplyComposeCandidates(postId)}
              applyComposeDisclaimer={getApplyComposeDisclaimer(postId)}
              onSelectApplyCandidate={(text) => onSelectApplyCandidate(postId, text)}
              onOpenComments={onOpenComments}
              onApplyJoin={onApplyJoin}
              onCloseComments={onCloseComments}
              onComposerFocus={onComposerFocus}
              onCommentSubmitted={onCommentSubmitted}
              onDelete={onDelete}
              onEdit={onEdit}
              onRecruitStatusToggle={onRecruitStatusToggle}
              onRecruitSlotsAdjust={onRecruitSlotsAdjust}
            />
          </View>
        );
      })}
      {isLoadingMore ? (
        <Text className="s-event-posts-list__loading">{t('common.loading')}</Text>
      ) : null}
    </View>
  );
}
