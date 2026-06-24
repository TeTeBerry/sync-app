import './EventsCatalogToolbar.scss';
import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import type { EventsSearchMode } from '@/domains/events-search/hooks/useEventsKnowledgeSearch';
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
  searchMode: EventsSearchMode;
  onSearchModeChange: (mode: EventsSearchMode) => void;
  region: EventsCatalogRegionFilter;
  timeChip: EventsCatalogTimeChip | null;
  onRegionChange: (region: EventsCatalogRegionFilter) => void;
  onTimeChipChange: (chip: EventsCatalogTimeChip | null) => void;
};

export const EventsCatalogToolbar: FC<EventsCatalogToolbarProps> = ({
  viewTab,
  searchQuery,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  region,
  timeChip,
  onRegionChange,
  onTimeChipChange,
}) => {
  const t = useT();
  const showSearch = viewTab === 'list';
  const showTimeChips = viewTab === 'list';

  return (
    <View
      className="s-events-toolbar s-events-toolbar--scroll"
      data-cmp="EventsCatalogToolbar"
    >
      {showSearch ? (
        <>
          <View className="s-events-toolbar__mode-tabs" role="tablist">
            <View
              className={
                searchMode === 'keyword'
                  ? 's-events-toolbar__mode-tab s-events-toolbar__mode-tab--active'
                  : 's-events-toolbar__mode-tab'
              }
              onClick={() => onSearchModeChange('keyword')}
              role="tab"
              aria-selected={searchMode === 'keyword'}
            >
              <Text className="s-events-toolbar__mode-tab-text">
                {t('events.searchMode.keyword')}
              </Text>
            </View>
            <View
              className={
                searchMode === 'knowledge'
                  ? 's-events-toolbar__mode-tab s-events-toolbar__mode-tab--active s-events-toolbar__mode-tab--knowledge'
                  : 's-events-toolbar__mode-tab s-events-toolbar__mode-tab--knowledge'
              }
              onClick={() => onSearchModeChange('knowledge')}
              role="tab"
              aria-selected={searchMode === 'knowledge'}
            >
              <Text className="s-events-toolbar__mode-tab-text">
                {t('events.searchMode.knowledge')}
              </Text>
            </View>
          </View>
          <EventsSearchBar
            embedded
            compact
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={
              searchMode === 'knowledge'
                ? t('events.knowledge.searchPlaceholder')
                : undefined
            }
          />
        </>
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
