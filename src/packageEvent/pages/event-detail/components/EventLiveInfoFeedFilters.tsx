import { Button } from '../../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';
import type { LiveInfoFeedFilters, LiveInfoZone } from '../../../../types/backend';
import { LIVE_INFO_CATEGORIES } from '../liveInfoConfig';

type EventLiveInfoFeedFiltersProps = {
  zones: LiveInfoZone[];
  filters: LiveInfoFeedFilters;
  onChange: (next: LiveInfoFeedFilters) => void;
};

export function EventLiveInfoFeedFilters({
  zones,
  filters,
  onChange,
}: EventLiveInfoFeedFiltersProps) {
  const activeZone = filters.zoneTag?.trim() ?? '';
  const activeCategory = filters.categoryId;

  return (
    <View className="s-live-info-filters">
      <View className="s-live-info-filters__row">
        <Text className="s-live-info-filters__label">区域</Text>
        <ScrollView
          scrollX
          enhanced
          showScrollbar={false}
          className="s-live-info-filters__scroll s-scrollbar-none"
        >
          <View className="s-live-info-filters__chips">
            <Button
              className={[
                's-live-info-filters__chip',
                !activeZone && 's-live-info-filters__chip--on',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange({ ...filters, zoneTag: undefined })}
            >
              <Text className="s-live-info-filters__chip-text">全部</Text>
            </Button>
            {zones.map((zone) => {
              const on = activeZone === zone.id;
              return (
                <Button
                  key={zone.id}
                  className={[
                    's-live-info-filters__chip',
                    on && 's-live-info-filters__chip--on',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() =>
                    onChange({
                      ...filters,
                      zoneTag: on ? undefined : zone.id,
                    })
                  }
                >
                  <Text className="s-live-info-filters__chip-text">{zone.label}</Text>
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View className="s-live-info-filters__row">
        <Text className="s-live-info-filters__label">类目</Text>
        <ScrollView
          scrollX
          enhanced
          showScrollbar={false}
          className="s-live-info-filters__scroll s-scrollbar-none"
        >
          <View className="s-live-info-filters__chips">
            <Button
              className={[
                's-live-info-filters__chip',
                !activeCategory && 's-live-info-filters__chip--on',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange({ ...filters, categoryId: undefined })}
            >
              <Text className="s-live-info-filters__chip-text">全部</Text>
            </Button>
            {LIVE_INFO_CATEGORIES.map((category) => {
              const on = activeCategory === category.id;
              return (
                <Button
                  key={category.id}
                  className={[
                    's-live-info-filters__chip',
                    on && 's-live-info-filters__chip--on',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() =>
                    onChange({
                      ...filters,
                      categoryId: on ? undefined : category.id,
                    })
                  }
                >
                  <Text className="s-live-info-filters__chip-text">
                    {category.label}
                  </Text>
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View className="s-live-info-filters__row s-live-info-filters__row--toggle">
        <Text className="s-live-info-filters__label">仅我在现场</Text>
        <Button
          className={[
            's-live-info-filters__toggle',
            filters.certifiedOnly && 's-live-info-filters__toggle--on',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() =>
            onChange({
              ...filters,
              certifiedOnly: !filters.certifiedOnly,
            })
          }
        >
          <Text className="s-live-info-filters__toggle-text">
            {filters.certifiedOnly ? '已开启' : '关闭'}
          </Text>
        </Button>
      </View>
    </View>
  );
}
