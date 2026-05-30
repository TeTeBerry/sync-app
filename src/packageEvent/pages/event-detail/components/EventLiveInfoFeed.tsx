import { Text, View } from "@tarojs/components";
import type { LiveInfoFeedItem } from "../liveInfoMock";
import { EventLiveInfoFeedItem } from "./EventLiveInfoFeedItem";

type EventLiveInfoFeedProps = {
  items: LiveInfoFeedItem[];
  onToggleLike: (id: string) => void;
};

export function EventLiveInfoFeed({ items, onToggleLike }: EventLiveInfoFeedProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <View className="s-live-info-card">
      <View className="s-live-info-card__head">
        <Text className="s-live-info-card__title">最新动态</Text>
        <Text className="s-live-info-card__meta">由认证用户持续更新</Text>
      </View>
      {safeItems.length === 0 ? (
        <Text className="s-live-info-feed__empty">暂无动态，成为第一个更新的人吧</Text>
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
