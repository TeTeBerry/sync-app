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
  filterContentTypeTags,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from './ContentTypeBadge';
import { formatContentTypeHashtag } from '../../utils/postContentTypeDisplay';
import { PostTagBadge } from './PostTagBadge';
import { PostImageGrid } from './PostImageGrid';
import { MapPin, Ticket } from '../icons';
import { useCurrentUserQuery } from '../../hooks/useSyncApi';
import { isCurrentUserPostAuthor } from '../../utils/postOwnership';
import type { EventDetailPost } from '../../types/backend';
import type { HomeFeedPost } from '../../types/post';
import { thumbnailImageUrl } from '../../utils/imageUrl';
import { isSharePost } from '../../utils/postContentTypeDisplay';
import { POST_ACTION_ICON_COLOR } from '../../utils/postActionColors';
import { WechatEmojiText } from '../wechat-emoji/WechatEmojiText';
import { Image, Text, View } from '@tarojs/components';

export type FeedPostListInfiniteFooter = {
  isLoadingMore: boolean;
  showEnd: boolean;
  sharerCount: number;
};

export type FeedPostListProps = {
  items: HomeFeedPost[];
  onDelete?: (post: HomeFeedPost) => void;
  onLike?: (post: HomeFeedPost) => void;
  onCommentSubmitted?: (
    updated: Pick<EventDetailPost, 'id' | 'comments' | 'likes' | 'liked'>,
  ) => void;
  /** Parent-controlled windowing for scroll-driven infinite lists (e.g. explore share). */
  scrollWindow?: boolean;
  infiniteFooter?: FeedPostListInfiniteFooter;
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
  const contentTypeKeys = mergePostContentTypes(post.contentTypes, {
    body: post.body,
    tags: post.tags,
  });
  const bodyText = stripContentTypeHashtags(post.body);
  const displayTags = filterContentTypeTags(post.tags, contentTypeKeys);
  const eventLocation = post.location?.trim();
  const eventTitle = post.event?.trim();
  const sharePost = isSharePost(post);
  const headerTypeKey = contentTypeKeys[0];
  const shareImages = sharePost ? post.images : undefined;

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
          <View className="s-home-post__title-row">
            <Text className="s-home-post__user-name">{postName}</Text>
            <Text className="s-home-post__user-handle">{postHandle}</Text>
          </View>
          <View className="s-home-post__meta">
            {eventLocation ? (
              <>
                <MapPin
                  size={10}
                  color={POST_ACTION_ICON_COLOR}
                  className="s-home-post__meta-icon"
                />
                <Text className="s-home-post__meta-text">{eventLocation}</Text>
                <Text className="s-home-post__meta-sep"> · </Text>
              </>
            ) : null}
            <Text className="s-home-post__meta-text">{post.time}</Text>
          </View>
        </View>
        <View className="s-home-post__head-badge">
          {sharePost && headerTypeKey ? (
            <View className="s-home-post__type-badge">
              <Text className="s-home-post__type-badge-text">
                {formatContentTypeHashtag(headerTypeKey)}
              </Text>
            </View>
          ) : !sharePost ? (
            <PostStatusBadge
              post={{ status: post.status ?? '招募中' }}
              variant="home"
              isOwn={isOwn}
            />
          ) : null}
        </View>
      </View>

      <View
        className={[
          's-home-post__content',
          shareImages?.length && 's-home-post__content--with-media',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {bodyText ? (
          <View className="s-home-post__body">
            <WechatEmojiText text={bodyText} className="s-home-post__text" />
          </View>
        ) : null}

        {eventTitle ? (
          <View className="s-home-post__event-pill">
            <Ticket
              size={12}
              color="#8e8e93"
              className="s-home-post__event-pill-icon"
            />
            <Text className="s-home-post__event-pill-text">{eventTitle}</Text>
          </View>
        ) : null}

        {shareImages?.length ? (
          <PostImageGrid
            images={shareImages}
            maxDisplay={FEED_POST_IMAGE_MAX_DISPLAY}
          />
        ) : null}

        {displayTags.length ? (
          <View className="s-home-post__tags">
            {displayTags.map((tag) => (
              <PostTagBadge key={tag} tag={tag} />
            ))}
          </View>
        ) : null}
      </View>

      <View className="s-home-post__footer">
        <PostCardActionBar
          variant="home"
          liked={Boolean(post.liked)}
          likes={post.likes}
          comments={post.comments}
          commentsExpanded={commentsExpanded}
          onLike={() => onLike?.(post)}
          onToggleComments={() => onToggleComments(post.id)}
        />
        <View className="s-home-post__footer-end">
          {isOwn && onDelete ? (
            <PostActionMenu
              postId={post.id}
              authorUserId={post.userId}
              onDelete={() => onDelete(post)}
            />
          ) : !isOwn ? (
            <PostActionMenu postId={post.id} authorUserId={post.userId} />
          ) : null}
          <PostShareButton
            share={buildPostSharePayload({
              postId: post.id,
              activityLegacyId: post.activityLegacyId,
              body: post.body,
              eventTitle: post.event,
              authorName: postName,
              images: shareImages,
              avatar: post.avatar,
            })}
          />
        </View>
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
  scrollWindow = false,
  infiniteFooter,
}: FeedPostListProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const [expandedCommentPostIds, setExpandedCommentPostIds] = useState<Set<string>>(
    () => new Set(),
  );

  const windowed = useWindowedList(items, {
    initialSize: HOME_FEED_INITIAL_RENDER,
    step: HOME_FEED_INITIAL_RENDER,
  });
  const visibleItems = scrollWindow ? items : windowed.visibleItems;
  const hasMoreToShow = scrollWindow ? false : windowed.hasMoreToShow;
  const hiddenCount = scrollWindow ? 0 : windowed.hiddenCount;
  const showMore = windowed.showMore;
  const ensureIndexVisible = windowed.ensureIndexVisible;

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
      {!scrollWindow && hasMoreToShow ? (
        <View
          className="s-feed-post-list__more"
          onClick={showMore}
          role="button"
          aria-label={`展开更多帖子，还有 ${hiddenCount} 条`}
        >
          <Text className="s-feed-post-list__more-text">展开更多（{hiddenCount}）</Text>
        </View>
      ) : null}
      {scrollWindow && infiniteFooter?.isLoadingMore ? (
        <Text className="s-feed-post-list__footer-line">加载更多…</Text>
      ) : null}
      {scrollWindow && infiniteFooter?.showEnd ? (
        <View className="s-feed-post-list__end">
          <Text className="s-feed-post-list__footer-line">
            已经有{infiniteFooter.sharerCount}人正在分享
          </Text>
          <Text className="s-feed-post-list__footer-line">已经到底啦 ~</Text>
        </View>
      ) : null}
    </View>
  );
}

export const FeedPostList: FC<FeedPostListProps> = memo(FeedPostListInner);
