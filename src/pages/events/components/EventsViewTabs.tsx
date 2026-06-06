import type { FC } from 'react';
import { CalendarDays, List, Map } from '../../../components/icons';
import { Text, View } from '@tarojs/components';

import type { EventsViewTab } from '../../../utils/eventsTabIntent';

export type { EventsViewTab };

const TABS: Array<{
  id: EventsViewTab;
  label: string;
  Icon: typeof CalendarDays;
}> = [
  { id: 'calendar', label: '日历', Icon: CalendarDays },
  { id: 'map', label: '地图', Icon: Map },
  { id: 'list', label: '列表', Icon: List },
];

type EventsViewTabsProps = {
  activeTab: EventsViewTab;
  onChange: (tab: EventsViewTab) => void;
};

export const EventsViewTabs: FC<EventsViewTabsProps> = ({ activeTab, onChange }) => {
  return (
    <View className="s-events-view-tabs" role="tablist" aria-label="活动视图">
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <View
            key={id}
            className={[
              's-events-view-tabs__item',
              active ? 's-events-view-tabs__item--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
          >
            <Icon size={16} color={active ? '#ffffff' : '#8e8e93'} aria-hidden />
            <Text className="s-events-view-tabs__label">{label}</Text>
          </View>
        );
      })}
    </View>
  );
};
