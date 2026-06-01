import { Text, View } from '@tarojs/components';

export type EventDetailTabId = 'posts' | 'live';

type EventDetailContentTabsProps = {
  active: EventDetailTabId;
  postsCount: number;
  liveCount: number;
  onChange: (tab: EventDetailTabId) => void;
};

export function EventDetailContentTabs({
  active,
  postsCount,
  liveCount,
  onChange,
}: EventDetailContentTabsProps) {
  return (
    <View className="s-event-detail-tabs">
      <View
        className={[
          's-event-detail-tabs__item',
          active === 'posts' && 's-event-detail-tabs__item--active',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange('posts')}
      >
        <Text className="s-event-detail-tabs__label">活动帖子</Text>
        <Text className="s-event-detail-tabs__badge">{postsCount}</Text>
      </View>
      <View
        className={[
          's-event-detail-tabs__item',
          active === 'live' && 's-event-detail-tabs__item--active',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange('live')}
      >
        <Text className="s-event-detail-tabs__label">现场实时资讯</Text>
        <Text className="s-event-detail-tabs__badge">{liveCount}</Text>
      </View>
    </View>
  );
}
