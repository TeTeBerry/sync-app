import { useEffect, useRef } from "react";
import { EventPostCard, type EventPostCardProps } from "./EventPostCard";
import { View } from "@tarojs/components";

export type EventPostListItem = {
  post: import("../../../types/backend").EventDetailPost;
  publishTimeLabel: string;
};

type EventPostsVirtualListProps = {
  onScrollToPostId?: (elementId: string) => void;
  items: EventPostListItem[];
  highlightPostId: string;
  expandedCommentPostIds: Set<string>;
  appliedPostIds: Set<string>;
  apiEnabled: boolean;
  currentUserAvatar?: string;
  onLike: EventPostCardProps["onLike"];
  onToggleComments: EventPostCardProps["onToggleComments"];
  onDelete: EventPostCardProps["onDelete"];
  onApply: EventPostCardProps["onApply"];
  onComplete?: EventPostCardProps["onComplete"];
  onCommentSubmitted: EventPostCardProps["onCommentSubmitted"];
};

export function EventPostsVirtualList({
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
}: EventPostsVirtualListProps) {
  const highlightScrolledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!highlightPostId || items.length === 0) return;
    if (highlightScrolledRef.current === highlightPostId) return;

    const index = items.findIndex((item) => item.post.id === highlightPostId);
    if (index < 0) return;

    highlightScrolledRef.current = highlightPostId;

    const elId = `post-${highlightPostId}`;
    setTimeout(() => onScrollToPostId?.(elId), 100);
  }, [highlightPostId, items, onScrollToPostId]);

  return (
    <View className="s-event-posts-list">
      {items.map((item) => {
        const highlighted = item.post.id === highlightPostId;
        return (
          <View key={item.post.id} id={`post-${item.post.id}`}>
            <EventPostCard
              post={item.post}
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
    </View>
  );
}
