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
  appliedPostIds: Set<string>;
  apiEnabled: boolean;
  currentUserAvatar?: string;
  onLike: EventPostCardProps['onLike'];
  onToggleComments: EventPostCardProps['onToggleComments'];
  onDelete: EventPostCardProps['onDelete'];
  onApply: EventPostCardProps['onApply'];
  onComplete?: EventPostCardProps['onComplete'];
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
  appliedPostIds,
  apiEnabled,
  currentUserAvatar,
  onLike,
  onToggleComments,
  onDelete,
  onApply,
  onComplete,
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
          <View key={item.post.id} id={`post-${item.post.id}`}>
            <EventPostCard
              post={item.post}
              activityLegacyId={activityLegacyId}
              publishTimeLabel={item.publishTimeLabel}
              highlighted={highlighted}
              commentsExpanded={expandedCommentPostIds.has(item.post.id)}
              applied={appliedPostIds.has(item.post.id)}
              apiEnabled={apiEnabled}
              currentUserAvatar={currentUserAvatar}
              onLike={onLike}
              onToggleComments={onToggleComments}
              onDelete={onDelete}
              onApply={onApply}
              onComplete={onComplete}
              onCommentSubmitted={onCommentSubmitted}
            />
          </View>
        );
      })}
      {isLoadingMore ? (
        <Text className="s-event-posts-list__more">加载更多…</Text>
      ) : null}
      {!hasMore && !hasMoreLocal && items.length > 0 ? (
        <Text className="s-event-posts-list__more s-event-posts-list__more--end">
          没有更多帖子了
        </Text>
      ) : null}
    </View>
  );
}
