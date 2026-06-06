import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from '@tarojs/components';
import type { ActivityMapRegion } from '../../../constants/activityMapRegion';
import MapFeatureDeveloping from '../../../components/MapFeatureDeveloping';
import { getActivityStatusFromActivity } from '../../../utils/activityStatus';
import type { EventCardUi } from '../../../utils/apiMappers';
import { filterMappableActivitiesByRegion } from '../../../utils/activityMapMarkers';
import { EventsActivityList } from './EventsActivityList';
import { EventsMapRegionTabs } from './EventsMapRegionTabs';

const EVENTS_MAP_STAGE_PX = 300;

type EventsActivityMapTabProps = {
  events: EventCardUi[];
  listHeight?: number;
  isError: boolean;
  registeredLegacyIds: Set<number>;
  onRetry: () => void;
  onOpenDetail: (legacyId: string) => void;
  onWarmDetail: (event: EventCardUi) => void;
};

export const EventsActivityMapTab: FC<EventsActivityMapTabProps> = ({
  events,
  listHeight,
  isError,
  registeredLegacyIds,
  onRetry,
  onOpenDetail,
  onWarmDetail,
}) => {
  const [region, setRegion] = useState<ActivityMapRegion>('domestic');

  const upcomingEvents = useMemo(
    () =>
      events.filter(
        (event) => getActivityStatusFromActivity(event.date, event.title) !== 'ended',
      ),
    [events],
  );

  const regionActivities = useMemo(
    () => filterMappableActivitiesByRegion(upcomingEvents, region),
    [upcomingEvents, region],
  );

  const listScrollHeight =
    listHeight != null
      ? Math.max(listHeight - EVENTS_MAP_STAGE_PX - 52, 160)
      : undefined;

  return (
    <View
      data-cmp="EventsActivityMapTab"
      className="s-events-map-tab"
      style={listHeight != null ? { height: `${listHeight}px` } : undefined}
    >
      <EventsMapRegionTabs
        activeRegion={region}
        activityCount={regionActivities.length}
        onChange={setRegion}
      />

      <View
        className="s-events-map-tab__stage"
        style={{ height: `${EVENTS_MAP_STAGE_PX}px` }}
      >
        <MapFeatureDeveloping className="s-events-map-tab__developing" />
      </View>

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-events-map-tab__list-scroll s-scrollbar-none"
        style={
          listScrollHeight != null ? { height: `${listScrollHeight}px` } : undefined
        }
      >
        <View className="s-events-map-tab__list-inner">
          <Text className="s-events-map-tab__hint">
            地图功能开发中，可先浏览下方活动列表
          </Text>
          <EventsActivityList
            events={regionActivities}
            isError={isError}
            emptyText="该区域暂无活动"
            registeredLegacyIds={registeredLegacyIds}
            onRetry={onRetry}
            onOpenDetail={onOpenDetail}
            onWarmDetail={onWarmDetail}
          />
        </View>
      </ScrollView>
    </View>
  );
};
