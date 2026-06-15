import './FeedPostList.scss';
import { memo, type FC } from 'react';
import {
  FEED_POST_IMAGE_MAX_DISPLAY,
  HOME_FEED_INITIAL_RENDER,
} from '../../constants/listPerf';
import { useWindowedList } from '../../hooks/useWindowedList';
import { stripContentTypeHashtags } from './ContentTypeBadge';
import { PostImageGrid } from './PostImageGrid';
import { PostOwnerDeleteButton } from './PostOwnerDeleteButton';
import { MapPin, Ticket } from '../icons';
import type { HomeFeedPost } from '../../types/post';
import { isCurrentUserPostAuthor } from '../../utils/postOwnership';
import { thumbnailImageUrl } from '../../utils/imageUrl';
import { WechatEmojiText } from '../wechat-emoji/WechatEmojiText';
import { Image, Text, View } from '@tarojs/components';

export type FeedPostListProps = {
  items: HomeFeedPost[];
  onDelete?: (post: HomeFeedPost) => void;
};

type FeedPostRowProps = {
  post: HomeFeedPost;
  onDelete?: (post: HomeFeedPost) => void;
};

function FeedPostRowInner({ post, onDelete }: FeedPostRowProps) {
  const postName = post.name?.trim() || '用户';
  const postHandle = post.handle?.trim() || `@${postName}`;
  const isOwn = isCurrentUserPostAuthor(postName, post.userId);
  const avatarSrc = thumbnailImageUrl(post.avatar, 80) ?? post.avatar;
  const bodyText = stripContentTypeHashtags(post.body);
  const eventLocation = post.location?.trim();
  const eventTitle = post.event?.trim();
  const postImages = post.images?.length ? post.images : undefined;

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
                <MapPin size={10} color="#8e8e93" className="s-home-post__meta-icon" />
                <Text className="s-home-post__meta-text">{eventLocation}</Text>
                <Text className="s-home-post__meta-sep"> · </Text>
              </>
            ) : null}
            <Text className="s-home-post__meta-text">{post.time}</Text>
          </View>
        </View>
        {isOwn && onDelete ? (
          <View className="s-home-post__head-actions">
            <PostOwnerDeleteButton onDelete={() => onDelete(post)} />
          </View>
        ) : null}
      </View>

      <View
        className={[
          's-home-post__content',
          postImages?.length && 's-home-post__content--with-media',
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

        {postImages?.length ? (
          <PostImageGrid images={postImages} maxDisplay={FEED_POST_IMAGE_MAX_DISPLAY} />
        ) : null}
      </View>
    </View>
  );
}

const FeedPostRow = memo(FeedPostRowInner);

function FeedPostListInner({ items, onDelete }: FeedPostListProps) {
  const windowed = useWindowedList(items, {
    initialSize: HOME_FEED_INITIAL_RENDER,
    step: HOME_FEED_INITIAL_RENDER,
  });

  return (
    <View className="s-feed-post-list">
      {windowed.visibleItems.map((post) => (
        <FeedPostRow key={post.id} post={post} onDelete={onDelete} />
      ))}
      {windowed.hasMoreToShow ? (
        <View
          className="s-feed-post-list__more"
          onClick={windowed.showMore}
          role="button"
          aria-label={`展开更多帖子，还有 ${windowed.hiddenCount} 条`}
        >
          <Text className="s-feed-post-list__more-text">
            展开更多（{windowed.hiddenCount}）
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export const FeedPostList: FC<FeedPostListProps> = memo(FeedPostListInner);
