import { useEffect, useRef } from 'react';
import type { EventPostListItem } from '../utils/eventPostNormalize';
import { EventPostCard, type EventPostCardProps } from './EventPostCard';
import { Text, View } from '@tarojs/components';

export type { EventPostListItem };

type EventPostsVirtualListProps = {
  activityLegacyId: number;
  onScrollToPostId?: (elementId: string) => void;
  items: EventPostListItem[];
  highlightPostId: string;
  expandedCommentPostIds: Set<string>;
  currentUserAvatar?: string;
  onLike: EventPostCardProps['onLike'];
  onToggleComments: EventPostCardProps['onToggleComments'];
  onDelete: EventPostCardProps['onDelete'];
  onCommentSubmitted: EventPostCardProps['onCommentSubmitted'];
  hasMore?: boolean;
  hasMoreLocal?: boolean;
  isLoadingMore?: boolean;
};

export function EventPostsVirtualList({
  activityLegacyId,
  onScrollToPostId,
  items,
  highlightPostId,
  expandedCommentPostIds,
  currentUserAvatar,
  onLike,
  onToggleComments,
  onDelete,
  onCommentSubmitted,
  hasMore = false,
  hasMoreLocal = false,
  isLoadingMore = false,
}: EventPostsVirtualListProps) {
  const highlightScrolledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!highlightPostId) return;
    if (highlightScrolledRef.current === highlightPostId) return;
    if (!items.some((item) => item.post.id === highlightPostId)) return;

    highlightScrolledRef.current = highlightPostId;
    const elId = `post-${highlightPostId}`;
    setTimeout(() => onScrollToPostId?.(elId), 150);
  }, [highlightPostId, items, onScrollToPostId]);

  return (
    <View className="s-event-posts-list">
      {items.map((item) => {
        const highlighted = item.post.id === highlightPostId;
        return (
          <View
            key={item.post.id}
            id={`post-${item.post.id}`}
            className="s-event-posts-list__item"
          >
            <EventPostCard
              post={item.post}
              activityLegacyId={activityLegacyId}
              publishTimeLabel={item.publishTimeLabel}
              highlighted={highlighted}
              commentsExpanded={expandedCommentPostIds.has(item.post.id)}
              currentUserAvatar={currentUserAvatar}
              onLike={onLike}
              onToggleComments={onToggleComments}
              onDelete={onDelete}
              onCommentSubmitted={onCommentSubmitted}
            />
          </View>
        );
      })}
      {isLoadingMore ? (
        <Text className="s-event-posts-list__loading">加载中…</Text>
      ) : null}
      {!isLoadingMore && !hasMoreLocal && !hasMore && items.length > 0 ? null : null}
    </View>
  );
}
