import './EventsCatalogToolbar.scss';
import type { FC } from 'react';
import { EventsSearchBar } from './EventsSearchBar';
import { EventsCatalogFilterChips } from './EventsCatalogFilterChips';
import type { EventsViewTab } from './EventsViewTabs';
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
};

export const EventsCatalogToolbar: FC<EventsCatalogToolbarProps> = ({
  viewTab,
  searchQuery,
  onSearchChange,
  region,
  timeChip,
  onRegionChange,
  onTimeChipChange,
}) => {
  const showSearch = viewTab === 'list';
  const showTimeChips = viewTab === 'list';

  return (
    <View
      className="s-events-toolbar s-events-toolbar--scroll"
      data-cmp="EventsCatalogToolbar"
    >
      {showSearch ? (
        <EventsSearchBar
          embedded
          compact
          value={searchQuery}
          onChange={onSearchChange}
        />
      ) : null}
      <EventsCatalogFilterChips
        embedded
        compact
        region={region}
        timeChip={timeChip}
        showTimeChips={showTimeChips}
        onRegionChange={onRegionChange}
        onTimeChipChange={onTimeChipChange}
      />
    </View>
  );
};
