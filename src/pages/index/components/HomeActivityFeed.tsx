import { ChevronRight } from "lucide-react-taro";
import type { FC } from "react";
import { Button } from "../../../components/ui";
import { FeedPostList } from "../../../components/FeedPostList";
import type { ActivityPost } from "../homeData";
import { Text, View } from '@tarojs/components';

type HomeActivityFeedProps = {
  items: ActivityPost[];
  onSeeAll: () => void;
  onDelete?: (post: ActivityPost) => void;
  onLike?: (post: ActivityPost) => void;
  onCommentSubmitted?: () => void;
};

export const HomeActivityFeed: FC<HomeActivityFeedProps> = ({
  items,
  onSeeAll,
  onDelete,
  onLike,
  onCommentSubmitted,
}) => {
  return (
    <View className="s-home-feed">
      <View className="s-home-feed__head">
        <Text>更多热门帖子</Text>
        <Button className="s-home-feed__link" onClick={onSeeAll}>
          查看全部
          <ChevronRight size={16} />
        </Button>
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
