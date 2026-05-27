import { useEffect, useRef, type RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EventPostCard, type EventPostCardProps } from "./EventPostCard";

const ESTIMATED_POST_HEIGHT = 280;

export type EventPostListItem = {
  post: import("../../../types/backend").EventDetailPost;
  publishTimeLabel: string;
};

type EventPostsVirtualListProps = {
  scrollRef: RefObject<HTMLElement | null>;
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
  onCommentSubmitted: EventPostCardProps["onCommentSubmitted"];
};

export function EventPostsVirtualList({
  scrollRef,
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
  onCommentSubmitted,
}: EventPostsVirtualListProps) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_POST_HEIGHT,
    overscan: 4,
  });

  const highlightScrolledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!highlightPostId || items.length === 0) return;
    if (highlightScrolledRef.current === highlightPostId) return;

    const index = items.findIndex((item) => item.post.id === highlightPostId);
    if (index < 0) return;

    highlightScrolledRef.current = highlightPostId;
    requestAnimationFrame(() => {
      virtualizer.scrollToIndex(index, { align: "center", behavior: "smooth" });
    });
  }, [highlightPostId, items, virtualizer]);

  useEffect(() => {
    virtualizer.measure();
  }, [expandedCommentPostIds, items, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      className="s-event-detail__posts-virtual"
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      <div className="s-event-detail__posts-inner">
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          if (!item) return null;

          const highlighted = item.post.id === highlightPostId;

          return (
            <div
              key={item.post.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="s-event-detail__posts-row"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
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
                onCommentSubmitted={onCommentSubmitted}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
