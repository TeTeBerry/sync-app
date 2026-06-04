import { memo } from 'react';
import AiAssistantPostCard from '../AiAssistantPostCard';
import type { RecommendedPostCard } from '../../types/aiChat';
import { AI_RECOMMEND_SECTION_HINT } from '../../constants/aiDisclosure';
import { AiRecommendBadge } from './AiRecommendBadge';
import { Text, View } from '@tarojs/components';

export const RecommendPostCards = memo(function RecommendPostCards({
  posts,
  variant = 'recommend',
}: {
  posts: RecommendedPostCard[];
  variant?: 'recommend' | 'created';
}) {
  if (!posts.length) return null;
  const isAiRecommend = variant === 'recommend';

  return (
    <View className="s-ai-assistant-chat__post-cards">
      {isAiRecommend ? (
        <View className="s-ai-disclosure-section">
          <AiRecommendBadge />
          <Text className="s-ai-disclosure-section__hint">
            {AI_RECOMMEND_SECTION_HINT}
          </Text>
        </View>
      ) : null}
      {posts.map((post) => (
        <AiAssistantPostCard
          key={post.postId}
          post={post}
          highlight={variant === 'created'}
        />
      ))}
    </View>
  );
});
