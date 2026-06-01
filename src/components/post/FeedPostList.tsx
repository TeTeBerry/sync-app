import './FeedPostList.scss';
import { memo, useCallback, useState, type FC } from 'react';
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
import { useCurrentUserQuery } from '../../hooks/useSyncApi';
import { isCurrentUserPostAuthor } from '../../utils/postOwnership';
import type { HomeFeedPost } from '../../types/post';
import { thumbnailImageUrl } from '../../utils/imageUrl';
import { inferAuthorGenderFromPost } from '../../utils/inferAuthorGender';
import { Image, Text, View } from '@tarojs/components';

export type FeedPostListProps = {
  items: HomeFeedPost[];
  onDelete?: (post: HomeFeedPost) => void;
  onLike?: (post: HomeFeedPost) => void;
  onCommentSubmitted?: () => void;
};

type FeedPostRowProps = {
  post: HomeFeedPost;
  commentsExpanded: boolean;
  currentUserAvatar?: string;
  onDelete?: (post: HomeFeedPost) => void;
  onLike?: (post: HomeFeedPost) => void;
  onCommentSubmitted?: () => void;
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
  const authorGender = inferAuthorGenderFromPost({
    userId: post.userId,
    authorName: postName,
    authorGender: post.authorGender,
    body: post.body,
    tags: post.contentTypes,
  });
  const locationClassName = post.location
    ? authorGender
      ? `s-home-post__user-location s-home-post__user-location--${authorGender}`
      : 's-home-post__user-location'
    : '';

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
              {post.location ? (
                <Text className={locationClassName}>
                  <Text className="s-home-post__user-location-sep"> · </Text>
                  {post.location}
                </Text>
              ) : null}
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
          <Text className="s-home-post__event-name">{post.event}</Text>
        </View>
      </View>

      {bodyText ? <Text className="s-home-post__text">{bodyText}</Text> : null}

      {post.images?.length ? <PostImageGrid images={post.images} /> : null}

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

      <PostCommentSection
        postId={post.id}
        postAuthorName={postName}
        postAuthorUserId={post.userId}
        expanded={commentsExpanded}
        onToggleExpanded={() => onToggleComments(post.id)}
        currentUserAvatar={currentUserAvatar}
        onCommentSubmitted={onCommentSubmitted}
      />
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

  return (
    <View className="s-feed-post-list">
      {items.map((post) => (
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
    </View>
  );
}

export const FeedPostList: FC<FeedPostListProps> = memo(FeedPostListInner);
