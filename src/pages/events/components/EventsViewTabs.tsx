import type { FC } from 'react';
import { CalendarDays, List, Users } from '../../../components/icons';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

import type { EventsViewTab } from '../../../utils/eventsTabIntent';

export type { EventsViewTab };

const TABS: Array<{
  id: EventsViewTab;
  labelKey: string;
  Icon: typeof CalendarDays;
}> = [
  { id: 'list', labelKey: 'events.viewTabs.list', Icon: List },
  { id: 'calendar', labelKey: 'events.viewTabs.calendar', Icon: CalendarDays },
  { id: 'artists', labelKey: 'events.viewTabs.artists', Icon: Users },
];

type EventsViewTabsProps = {
  activeTab: EventsViewTab;
  embedded?: boolean;
  onChange: (tab: EventsViewTab) => void;
};

export const EventsViewTabs: FC<EventsViewTabsProps> = ({
  activeTab,
  embedded = false,
  onChange,
}) => {
  const t = useT();
  return (
    <View
      className={['s-events-view-tabs', embedded ? 's-events-view-tabs--embedded' : '']
        .filter(Boolean)
        .join(' ')}
      role="tablist"
      aria-label={t('events.title')}
    >
      {TABS.map(({ id, labelKey, Icon }) => {
        const active = activeTab === id;
        const label = t(labelKey);
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
            <Icon
              size={15}
              color={active ? '#000' : 'rgba(255, 255, 255, 0.42)'}
              aria-hidden
            />
            <Text className="s-events-view-tabs__label">{label}</Text>
          </View>
        );
      })}
    </View>
  );
};
