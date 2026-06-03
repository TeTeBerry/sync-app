import './FeedPostList.scss';
import { memo, useCallback, useState, type FC } from 'react';
import {
  FEED_POST_IMAGE_MAX_DISPLAY,
  HOME_FEED_INITIAL_RENDER,
} from '../../constants/listPerf';
import { useWindowedList } from '../../hooks/useWindowedList';
import PostCardActionBar from './PostCardActionBar';
import { buildPostSharePayload } from './postCardShare';
import { PostCommentSection } from './PostCommentSection';
import { PostActionMenu, PostShareButton } from './PostActionMenu';
import { PostStatusBadge } from './PostStatusBadge';
import {
  ContentTypeBadge,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from './ContentTypeBadge';
import { PostImageGrid, PostImageCount } from './PostImageGrid';
import { MapPin } from '../icons';
import { useCurrentUserQuery } from '../../hooks/useSyncApi';
import { isCurrentUserPostAuthor } from '../../utils/postOwnership';
import type { EventDetailPost } from '../../types/backend';
import type { HomeFeedPost } from '../../types/post';
import { thumbnailImageUrl } from '../../utils/imageUrl';
import { POST_ACTION_ICON_COLOR } from '../../utils/postActionColors';
import { Image, Text, View } from '@tarojs/components';

export type FeedPostListProps = {
  items: HomeFeedPost[];
  onDelete?: (post: HomeFeedPost) => void;
  onLike?: (post: HomeFeedPost) => void;
  onCommentSubmitted?: (
    updated: Pick<EventDetailPost, 'id' | 'comments' | 'likes' | 'liked'>,
  ) => void;
};

type FeedPostRowProps = {
  post: HomeFeedPost;
  commentsExpanded: boolean;
  currentUserAvatar?: string;
  onDelete?: (post: HomeFeedPost) => void;
  onLike?: (post: HomeFeedPost) => void;
  onCommentSubmitted?: FeedPostListProps['onCommentSubmitted'];
  onToggleComments: (postId: string) => void;
};

function FeedPostRowInner({
  post,
  commentsExpanded,
  currentUserAvatar,
  onDelete,
  onLike,
  onCommentSubmitted,
  onToggleComments,
}: FeedPostRowProps) {
  const postName = post.name?.trim() || '用户';
  const postHandle = post.handle?.trim() || `@${postName}`;
  const isOwn = isCurrentUserPostAuthor(postName, post.userId);
  const avatarSrc = thumbnailImageUrl(post.avatar, 80) ?? post.avatar;
  const contentTypeKeys = mergePostContentTypes(post.contentTypes, { body: post.body });
  const bodyText = stripContentTypeHashtags(post.body);
  const eventLocation = post.location?.trim();

  return (
    <View className="s-home-post">
      <View className="s-home-post__header">
        <Image
          className="s-home-post__avatar"
          src={avatarSrc}
          mode="aspectFill"
          lazyLoad
        />
        <View className="s-home-post__head-main">
          <View className="s-home-post__top">
            <View className="s-home-post__user-line">
              <Text className="s-home-post__user-name">{postName}</Text>
              <Text className="s-home-post__user-handle">{postHandle}</Text>
              {post.images?.length ? (
                <PostImageCount count={post.images.length} />
              ) : null}
            </View>
            <View className="s-home-post__head-actions">
              <PostStatusBadge
                post={{ status: post.status ?? '招募中' }}
                variant="home"
                isOwn={isOwn}
              />
              <PostShareButton
                share={buildPostSharePayload({
                  postId: post.id,
                  activityLegacyId: post.activityLegacyId,
                  body: post.body,
                  eventTitle: post.event,
                  authorName: postName,
                  images: post.images,
                  avatar: post.avatar,
                })}
              />
              {isOwn && onDelete ? (
                <PostActionMenu
                  postId={post.id}
                  authorUserId={post.userId}
                  onDelete={() => onDelete(post)}
                />
              ) : !isOwn ? (
                <PostActionMenu postId={post.id} authorUserId={post.userId} />
              ) : null}
            </View>
          </View>
          <View className="s-home-post__event-line">
            {eventLocation ? (
              <View className="s-home-post__event-address-wrap">
                <MapPin
                  size={12}
                  color={POST_ACTION_ICON_COLOR}
                  className="s-home-post__event-address-icon"
                />
                <Text className="s-home-post__event-address">{eventLocation}</Text>
                <Text className="s-home-post__event-address-sep"> · </Text>
              </View>
            ) : null}
            <Text className="s-home-post__event-name">{post.event}</Text>
          </View>
        </View>
      </View>

      {bodyText ? <Text className="s-home-post__text">{bodyText}</Text> : null}

      {post.images?.length ? (
        <PostImageGrid images={post.images} maxDisplay={FEED_POST_IMAGE_MAX_DISPLAY} />
      ) : null}

      <ContentTypeBadge types={contentTypeKeys} />

      <View className="s-home-post__footer">
        <Text className="s-home-post__time">{post.time}</Text>
        <PostCardActionBar
          variant="home"
          liked={Boolean(post.liked)}
          likes={post.likes}
          comments={post.comments}
          commentsExpanded={commentsExpanded}
          onLike={() => onLike?.(post)}
          onToggleComments={() => onToggleComments(post.id)}
        />
      </View>

      {commentsExpanded ? (
        <PostCommentSection
          postId={post.id}
          postAuthorName={postName}
          postAuthorUserId={post.userId}
          expanded
          onToggleExpanded={() => onToggleComments(post.id)}
          currentUserAvatar={currentUserAvatar}
          onCommentSubmitted={onCommentSubmitted}
        />
      ) : null}
    </View>
  );
}

const FeedPostRow = memo(FeedPostRowInner);

function FeedPostListInner({
  items,
  onDelete,
  onLike,
  onCommentSubmitted,
}: FeedPostListProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const [expandedCommentPostIds, setExpandedCommentPostIds] = useState<Set<string>>(
    () => new Set(),
  );

  const { visibleItems, hasMoreToShow, hiddenCount, showMore, ensureIndexVisible } =
    useWindowedList(items, {
      initialSize: HOME_FEED_INITIAL_RENDER,
      step: HOME_FEED_INITIAL_RENDER,
    });

  const togglePostComments = useCallback(
    (postId: string) => {
      const index = items.findIndex((post) => post.id === postId);
      if (index >= 0) ensureIndexVisible(index);

      setExpandedCommentPostIds((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) {
          next.delete(postId);
        } else {
          next.add(postId);
        }
        return next;
      });
    },
    [items, ensureIndexVisible],
  );

  return (
    <View className="s-feed-post-list">
      {visibleItems.map((post) => (
        <FeedPostRow
          key={post.id}
          post={post}
          commentsExpanded={expandedCommentPostIds.has(post.id)}
          currentUserAvatar={currentUser?.avatar}
          onDelete={onDelete}
          onLike={onLike}
          onCommentSubmitted={onCommentSubmitted}
          onToggleComments={togglePostComments}
        />
      ))}
      {hasMoreToShow ? (
        <View
          className="s-feed-post-list__more"
          onClick={showMore}
          role="button"
          aria-label={`展开更多帖子，还有 ${hiddenCount} 条`}
        >
          <Text className="s-feed-post-list__more-text">展开更多（{hiddenCount}）</Text>
        </View>
      ) : null}
    </View>
  );
}

export const FeedPostList: FC<FeedPostListProps> = memo(FeedPostListInner);
