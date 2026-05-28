import "./FeedPostList.scss";
import { MapPin, MessageCircle, Share2, ThumbsUp, Trash2,  } from "lucide-react-taro";
import { memo, useCallback, useState, type FC } from "react";
import { Button } from "./ui";
import { MetaRow } from "./MetaRow";
import { PostCommentSection } from "./PostCommentSection";
import { PostActionMenu } from "./PostActionMenu";
import { PostStatusBadge } from "./PostStatusBadge";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { PostImageGrid, PostImageCount } from "./PostImageGrid";
import { useCurrentUserQuery } from "../hooks/useSyncApi";
import { isCurrentUserPostAuthor } from "../utils/postOwnership";
import type { ActivityPost } from "../pages/index/homeData";
import { Image, Text, View } from '@tarojs/components';

export type FeedPostListProps = {
  items: ActivityPost[];
  onDelete?: (post: ActivityPost) => void;
  onLike?: (post: ActivityPost) => void;
  onCommentSubmitted?: () => void;
};

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
      {items.map((post) => {
        const isOwn = isCurrentUserPostAuthor(post.name);
        const commentsExpanded = expandedCommentPostIds.has(post.id);

        return (
          <View key={post.id} className="s-home-post">
            <View className="s-home-post__header">
              <Image className="s-home-post__avatar" src={post.avatar} />
              <View className="s-home-post__head-main">
                <View className="s-home-post__top">
                  <Text>
                    <Text style={{fontWeight:"bold"}}>{post.name}</Text>
                    <Text>{post.handle}</Text>
                    {post.images?.length ? <PostImageCount count={post.images.length} /> : null}
                  </Text>
                  <View className="s-home-post__head-actions">
                    <PostStatusBadge status={post.status} variant="home" />
                    {!isOwn ? (
                      <PostActionMenu postId={post.id} authorUserId={post.userId} />
                    ) : null}
                  </View>
                </View>
                <Text>{post.event}</Text>
                <Text className="s-home-post__location">
                  <MetaRow icon={<MapPin size={13} />}>{post.location}</MetaRow>
                </Text>
              </View>
            </View>

            <Text className="s-home-post__text">{post.body}</Text>

            {post.images?.length ? <PostImageGrid images={post.images} fullBleed /> : null}

            <ContentTypeBadge types={post.contentTypes} />

            <View className="s-home-post__footer">
              <Text className="s-home-post__time">{post.time}</Text>
              <View className="s-home-post__actions">
                <Button
                  className={`s-home-post__action${post.liked ? " s-home-post__action--liked" : ""}`}
                  onClick={() => onLike?.(post)}
                >
                  <ThumbsUp size={16} fill={post.liked ? "currentColor" : "none"} />
                  {post.likes}
                </Button>
                <Button
                  className={`s-home-post__action${commentsExpanded ? " s-home-post__action--active" : ""}`}
                  onClick={() => togglePostComments(post.id)}
                >
                  <MessageCircle size={16} />
                  {post.comments}
                </Button>
                <Button className="s-home-post__action">
                  <Share2 size={16} />
                  分享
                </Button>
                {isOwn && onDelete ? (
                  <Button className="s-home-post__action" onClick={() => onDelete(post)}>
                    <Trash2 size={16} />
                    删除
                  </Button>
                ) : null}
              </View>
            </View>

            <PostCommentSection
              postId={post.id}
              expanded={commentsExpanded}
              onToggleExpanded={() => togglePostComments(post.id)}
              currentUserAvatar={currentUser?.avatar}
              onCommentSubmitted={onCommentSubmitted}
            />
          </View>
        );
      })}
    </View>
  );
}

export const FeedPostList = memo(FeedPostListInner);
