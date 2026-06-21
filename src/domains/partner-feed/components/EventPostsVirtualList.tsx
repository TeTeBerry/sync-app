import { useEffect, useRef } from 'react';
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
  onOpenComments: (postId: string) => void;
  onApplyJoin: (postId: string) => void;
  onCloseComments: (postId: string) => void;
  onCommentSubmitted?: EventPostCardProps['onCommentSubmitted'];
  onDelete?: EventPostCardProps['onDelete'];
  hasMore?: boolean;
  hasMoreLocal?: boolean;
  hiddenLocalCount?: number;
  onShowMoreLocal?: () => void;
  isLoadingMore?: boolean;
};

export function EventPostsVirtualList({
  onScrollToPostId,
  items,
  highlightPostId,
  expandedCommentPostIds,
  currentUserAvatar,
  getCommentDraft,
  onOpenComments,
  onApplyJoin,
  onCloseComments,
  onCommentSubmitted,
  onDelete,
  hasMore = false,
  hasMoreLocal = false,
  hiddenLocalCount = 0,
  onShowMoreLocal,
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
              commentDraft={getCommentDraft(item.post.id)}
              onOpenComments={onOpenComments}
              onApplyJoin={onApplyJoin}
              onCloseComments={onCloseComments}
              onCommentSubmitted={onCommentSubmitted}
              onDelete={onDelete}
            />
          </View>
        );
      })}
      {hasMoreLocal && hiddenLocalCount > 0 ? (
        <View
          className="s-event-posts-list__more-local"
          hoverClass="s-event-posts-list__more-local--pressed"
          onClick={onShowMoreLocal}
          role="button"
        >
          <Text className="s-event-posts-list__more-local-text">
            {t('eventDetail.postsShowMore', { count: hiddenLocalCount })}
          </Text>
        </View>
      ) : null}
      {isLoadingMore ? (
        <Text className="s-event-posts-list__loading">{t('common.loading')}</Text>
      ) : null}
      {!isLoadingMore && !hasMoreLocal && !hasMore && items.length > 0 ? null : null}
    </View>
  );
}
