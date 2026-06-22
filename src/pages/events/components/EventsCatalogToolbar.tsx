import './EventsCatalogToolbar.scss';
import type { FC } from 'react';
import { EventsSearchBar } from './EventsSearchBar';
import { EventsCatalogFilterChips } from './EventsCatalogFilterChips';
import { EventsViewTabs, type EventsViewTab } from './EventsViewTabs';
import type {
  EventsCatalogRegionFilter,
  EventsCatalogTimeChip,
} from '../../../utils/filterActivitiesForEventsCatalog';
import { View } from '@tarojs/components';

type EventsCatalogToolbarProps = {
  viewTab: EventsViewTab;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  region: EventsCatalogRegionFilter;
  timeChip: EventsCatalogTimeChip | null;
  onRegionChange: (region: EventsCatalogRegionFilter) => void;
  onTimeChipChange: (chip: EventsCatalogTimeChip | null) => void;
  onViewTabChange: (tab: EventsViewTab) => void;
};

export const EventsCatalogToolbar: FC<EventsCatalogToolbarProps> = ({
  viewTab,
  searchQuery,
  onSearchChange,
  region,
  timeChip,
  onRegionChange,
  onTimeChipChange,
  onViewTabChange,
}) => {
  const showSearch = viewTab === 'list';
  const showFilters = viewTab !== 'artists';

  return (
    <View className="s-events-toolbar" data-cmp="EventsCatalogToolbar">
      <View className="s-events-toolbar__panel">
        {showSearch ? (
          <EventsSearchBar embedded value={searchQuery} onChange={onSearchChange} />
        ) : null}
        {showFilters ? (
          <EventsCatalogFilterChips
            embedded
            region={region}
            timeChip={timeChip}
            showTimeChips={viewTab === 'list'}
            onRegionChange={onRegionChange}
            onTimeChipChange={onTimeChipChange}
          />
        ) : null}
        <View className="s-events-toolbar__divider" aria-hidden />
        <EventsViewTabs embedded activeTab={viewTab} onChange={onViewTabChange} />
      </View>
    </View>
  );
};
