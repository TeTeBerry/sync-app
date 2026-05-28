import "./FeedPostList.scss";
import { MapPin, MessageCircle, Share2, ThumbsUp, Trash2 } from "lucide-react-taro";
import { memo, useCallback, useState, type FC } from "react";
import { Button } from "./ui";
import { MetaRow } from "./MetaRow";
import { PostCommentSection } from "./PostCommentSection";
import { PostActionMenu } from "./PostActionMenu";
import { PostStatusBadge } from "./PostStatusBadge";
import {
  ContentTypeBadge,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from "./ContentTypeBadge";
import { PostImageGrid, PostImageCount } from "./PostImageGrid";
import { useCurrentUserQuery } from "../hooks/useSyncApi";
import { isCurrentUserPostAuthor } from "../utils/postOwnership";
import type { ActivityPost } from "../pages/index/homeData";
import { thumbnailImageUrl } from "../utils/imageUrl";
import { postActionIconColor } from "../utils/postActionColors";
import { Image, Text, View } from "@tarojs/components";

export type FeedPostListProps = {
  items: ActivityPost[];
  onDelete?: (post: ActivityPost) => void;
  onLike?: (post: ActivityPost) => void;
  onCommentSubmitted?: () => void;
};

type FeedPostRowProps = {
  post: ActivityPost;
  commentsExpanded: boolean;
  currentUserAvatar?: string;
  onDelete?: (post: ActivityPost) => void;
  onLike?: (post: ActivityPost) => void;
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
  const isOwn = isCurrentUserPostAuthor(post.name, post.userId);
  const avatarSrc = thumbnailImageUrl(post.avatar, 80) ?? post.avatar;
  const contentTypeKeys = mergePostContentTypes(post.contentTypes, { body: post.body });
  const bodyText = stripContentTypeHashtags(post.body);

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
            <Text className="s-home-post__user-line">
              <Text className="s-home-post__user-name">{post.name}</Text>
              <Text>{post.handle}</Text>
              {post.images?.length ? <PostImageCount count={post.images.length} /> : null}
            </Text>
            <View className="s-home-post__head-actions">
              <PostStatusBadge status={post.status} variant="home" isOwn={isOwn} />
              {!isOwn ? (
                <PostActionMenu postId={post.id} authorUserId={post.userId} />
              ) : null}
            </View>
          </View>
          <Text className="s-home-post__event-name">{post.event}</Text>
          <View className="s-home-post__location">
            <MetaRow
              className="s-home-post__meta-row"
              icon={<MapPin size={13} color="#4cc9f0" />}>
              {post.location}
            </MetaRow>
          </View>
        </View>
      </View>

      {bodyText ? <Text className="s-home-post__text">{bodyText}</Text> : null}

      {post.images?.length ? <PostImageGrid images={post.images} /> : null}

      <ContentTypeBadge types={contentTypeKeys} />

      <View className="s-home-post__footer">
        <Text className="s-home-post__time">{post.time}</Text>
        <View className="s-home-post__actions">
          <Button
            className={`s-home-post__action${post.liked ? " s-home-post__action--liked" : ""}`}
            onClick={() => onLike?.(post)}>
            <ThumbsUp
              size={16}
              filled={post.liked}
              color={postActionIconColor({ liked: post.liked })}
            />
            <Text className="s-home-post__action-label">{post.likes}</Text>
          </Button>
          <Button
            className={`s-home-post__action${commentsExpanded ? " s-home-post__action--active" : ""}`}
            onClick={() => onToggleComments(post.id)}>
            <MessageCircle
              size={16}
              color={postActionIconColor({ active: commentsExpanded })}
            />
            <Text className="s-home-post__action-label">{post.comments}</Text>
          </Button>
          <Button className="s-home-post__action">
            <Share2 size={16} color={postActionIconColor({})} />
            <Text className="s-home-post__action-label">分享</Text>
          </Button>
          {isOwn && onDelete ? (
            <Button className="s-home-post__action" onClick={() => onDelete(post)}>
              <Trash2 size={16} color={postActionIconColor({})} />
              <Text className="s-home-post__action-label">删除</Text>
            </Button>
          ) : null}
        </View>
      </View>

      <PostCommentSection
        postId={post.id}
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
