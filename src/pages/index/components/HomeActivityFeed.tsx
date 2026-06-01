import type { FC } from 'react';
import { FeedPostList } from '../../../components/post';
import type { HomeFeedPost } from '../../../types/post';
import { Text, View } from '@tarojs/components';

type HomeActivityFeedProps = {
  items: HomeFeedPost[];
  onDelete?: (post: HomeFeedPost) => void;
  onLike?: (post: HomeFeedPost) => void;
  onCommentSubmitted?: () => void;
};

export const HomeActivityFeed: FC<HomeActivityFeedProps> = ({
  items,
  onDelete,
  onLike,
  onCommentSubmitted,
}) => {
  return (
    <View className="s-home-feed">
      <View className="s-home-feed__head">
        <Text className="s-home-feed__title">更多热门帖子</Text>
      </View>

      <FeedPostList
        items={items}
        onDelete={onDelete}
        onLike={onLike}
        onCommentSubmitted={onCommentSubmitted}
      />
    </View>
  );
};
