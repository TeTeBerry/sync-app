import "./AiAssistantPostCard.scss";
import { MapPin } from "lucide-react-taro";
import type { FC } from "react";
import type { RecommendedPostCard } from "../types/aiChat";
import { inferAuthorGenderFromPost } from "../utils/inferAuthorGender";
import { goEventDetail } from "../utils/route";
import { Button, Image, Text, View } from '@tarojs/components';

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
    : "s-ai-assistant-post-card__name";

  const handleOpen = () => {
    const activityId = post.activityLegacyId;
    if (activityId != null && !Number.isNaN(activityId)) {
      goEventDetail(activityId, { postId: post.postId });
    }
  };

  return (
    <Button
      type="button"
      className={
        highlight
          ? "s-ai-assistant-post-card s-ai-assistant-post-card--mine"
          : "s-ai-assistant-post-card"
      }
      onClick={handleOpen}
    >
      <View className="s-ai-assistant-post-card__header">
        {post.authorAvatar ? (
          <Image
            className="s-ai-assistant-post-card__avatar"
            src={post.authorAvatar}
            decoding="async"
          />
        ) : (
          <Text className="s-ai-assistant-post-card__avatar s-ai-assistant-post-card__avatar--fallback">
            {post.authorName.slice(0, 1)}
          </Text>
        )}
        <View className="s-ai-assistant-post-card__meta">
          <Text style={{fontWeight:"bold"}} className={nameClassName}>{post.authorName}</Text>
          {post.authorHandle ? <Text>{post.authorHandle}</Text> : null}
          <Text>{post.eventTitle}</Text>
        </View>
      </View>
      <Text className="s-ai-assistant-post-card__body">{post.snippet}</Text>
      {post.location ? (
        <Text className="s-ai-assistant-post-card__location">
          <MapPin size={12} />
          <Text>{post.location}</Text>
        </Text>
      ) : null}
      {post.tags?.length ? (
        <View className="s-ai-assistant-post-card__tags">
          {post.tags.slice(0, 3).map((tag) => (
            <Text key={tag}>{tag}</Text>
          ))}
        </View>
      ) : null}
      <Text className="s-ai-assistant-post-card__cta">
        查看帖子
      </Text>
    </Button>
  );
};

export default AiAssistantPostCard;
