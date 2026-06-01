import { memo } from 'react';
import AiAssistantPostCard from '../AiAssistantPostCard';
import type { RecommendedPostCard } from '../../types/aiChat';
import { View } from '@tarojs/components';

export const RecommendPostCards = memo(function RecommendPostCards({
  posts,
  variant = 'recommend',
}: {
  posts: RecommendedPostCard[];
  variant?: 'recommend' | 'created';
}) {
  if (!posts.length) return null;

  return (
    <View className="s-ai-assistant-chat__post-cards">
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
