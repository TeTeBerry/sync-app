import './AiAssistantPostCard.scss';
import { PostTagBadge } from './post';
import { MapPin, Sparkles } from '../components/icons';
import type { FC } from 'react';
import type { RecommendedPostCard } from '../types/aiChat';
import { inferAuthorGenderFromPost } from '../utils/inferAuthorGender';
import { goEventDetail } from '../utils/route';
import { Button } from './ui';
import { Image, Text, View } from '@tarojs/components';

export type AiAssistantPostCardProps = {
  post: RecommendedPostCard;
  /** Emphasize card when showing the user's newly published post */
  highlight?: boolean;
};

export const AiAssistantPostCard: FC<AiAssistantPostCardProps> = ({
  post,
  highlight = false,
}) => {
  const authorGender = inferAuthorGenderFromPost(post);
  const nameClassName = authorGender
    ? `s-ai-assistant-post-card__name s-ai-assistant-post-card__name--${authorGender}`
    : 's-ai-assistant-post-card__name';

  const handleOpen = () => {
    const activityId = post.activityLegacyId;
    if (activityId != null && !Number.isNaN(activityId)) {
      goEventDetail(activityId, { postId: post.postId });
    }
  };

  return (
    <Button
      className={
        highlight
          ? 's-ai-assistant-post-card s-ai-assistant-post-card--mine'
          : 's-ai-assistant-post-card'
      }
      onClick={handleOpen}
    >
      <View className="s-ai-assistant-post-card__header">
        {post.authorAvatar ? (
          <Image className="s-ai-assistant-post-card__avatar" src={post.authorAvatar} />
        ) : (
          <Text className="s-ai-assistant-post-card__avatar s-ai-assistant-post-card__avatar--fallback">
            {post.authorName.slice(0, 1)}
          </Text>
        )}
        <View className="s-ai-assistant-post-card__author">
          <View className="s-ai-assistant-post-card__author-line">
            <Text className={nameClassName}>{post.authorName}</Text>
            {post.authorHandle ? (
              <Text className="s-ai-assistant-post-card__handle">
                {post.authorHandle}
              </Text>
            ) : null}
          </View>
          {post.matchReason ? (
            <View className="s-ai-assistant-post-card__match-badge">
              <Sparkles size={11} color="#ff3385" aria-hidden />
              <Text className="s-ai-assistant-post-card__match-badge-text">
                {post.matchReason}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text className="s-ai-assistant-post-card__title">{post.eventTitle}</Text>

      <Text className="s-ai-assistant-post-card__body">{post.snippet}</Text>

      {post.location ? (
        <View className="s-ai-assistant-post-card__location">
          <MapPin size={12} color="#64d2ff" />
          <Text className="s-ai-assistant-post-card__location-text">
            {post.location}
          </Text>
        </View>
      ) : null}

      {post.tags?.length ? (
        <View className="s-ai-assistant-post-card__tags">
          {post.tags.slice(0, 5).map((tag) => (
            <PostTagBadge key={tag} tag={tag} />
          ))}
        </View>
      ) : null}

      <View className="s-ai-assistant-post-card__cta">
        <Text className="s-ai-assistant-post-card__cta-label">查看帖子</Text>
      </View>
    </Button>
  );
};

export default AiAssistantPostCard;
