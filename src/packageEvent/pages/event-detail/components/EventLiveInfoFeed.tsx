import { Text, View } from '@tarojs/components';
import type { LiveInfoFeedItem } from '../liveInfoMock';
import { EventLiveInfoFeedItem } from './EventLiveInfoFeedItem';

type EventLiveInfoFeedProps = {
  items: LiveInfoFeedItem[];
  filtersActive?: boolean;
  onToggleLike: (id: string) => void;
};

export function EventLiveInfoFeed({
  items,
  filtersActive = false,
  onToggleLike,
}: EventLiveInfoFeedProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <View className="s-live-info-feed-section">
      <View className="s-live-info-feed-section__head">
        <Text className="s-live-info-feed-section__title">最新动态</Text>
        <Text className="s-live-info-feed-section__meta">由认证用户持续更新</Text>
      </View>
      {safeItems.length === 0 ? (
        <Text className="s-live-info-feed__empty">
          {filtersActive
            ? '当前筛选下暂无动态，试试调整区域或类目'
            : '暂无动态，成为第一个更新的人吧'}
        </Text>
      ) : (
        <View className="s-live-info-feed">
          {safeItems.map((item) => (
            <EventLiveInfoFeedItem
              key={item.id || item.userName}
              item={item}
              onToggleLike={onToggleLike}
            />
          ))}
        </View>
      )}
    </View>
  );
}
