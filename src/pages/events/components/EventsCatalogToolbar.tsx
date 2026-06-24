import './EventsCatalogToolbar.scss';
import type { FC } from 'react';
import { View } from '@tarojs/components';
import { EventsSearchBar } from './EventsSearchBar';
import { EventsCatalogFilterChips } from './EventsCatalogFilterChips';
import type { EventsViewTab } from './EventsViewTabs';
import type {
  EventsCatalogRegionFilter,
  EventsCatalogTimeChip,
} from '../../../utils/filterActivitiesForEventsCatalog';

type EventsCatalogToolbarProps = {
  viewTab: EventsViewTab;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  region: EventsCatalogRegionFilter;
  timeChip: EventsCatalogTimeChip | null;
  aiActive?: boolean;
  isSearching?: boolean;
  onRegionChange: (region: EventsCatalogRegionFilter) => void;
  onTimeChipChange: (chip: EventsCatalogTimeChip | null) => void;
};

export const EventsCatalogToolbar: FC<EventsCatalogToolbarProps> = ({
  viewTab,
  searchQuery,
  onSearchChange,
  region,
  timeChip,
  aiActive = false,
  isSearching = false,
  onRegionChange,
  onTimeChipChange,
}) => {
  const showSearch = viewTab === 'list';
  const showTimeChips = viewTab === 'list';

  return (
    <View className="s-events-toolbar" data-cmp="EventsCatalogToolbar">
      {showSearch ? (
        <EventsSearchBar
          value={searchQuery}
          onChange={onSearchChange}
          aiActive={aiActive}
          isSearching={isSearching}
        />
      ) : null}
      <EventsCatalogFilterChips
        embedded
        compact
        singleRow={showSearch}
        region={region}
        timeChip={timeChip}
        showTimeChips={showTimeChips}
        onRegionChange={onRegionChange}
        onTimeChipChange={onTimeChipChange}
      />
    </View>
  );
};
