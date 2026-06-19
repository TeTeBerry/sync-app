import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Map, ScrollView, Text, View } from '@tarojs/components';
import type { ActivityMapRegion } from '../../../constants/activityMapRegion';
import { getActivityStatusFromActivity } from '../../../utils/activityStatus';
import type { EventCardUi } from '../../../utils/apiMappers';
import { EventsActivityList } from './EventsActivityList';
import { EventsMapRegionTabs } from './EventsMapRegionTabs';
import { useEventsActivityMap } from '../hooks/useEventsActivityMap';

const EVENTS_MAP_STAGE_PX = 300;

type EventsActivityMapTabProps = {
  events: EventCardUi[];
  listHeight?: number;
  isError: boolean;
  onRetry: () => void;
  onOpenDetail: (legacyId: string) => void;
  onWarmDetail: (event: EventCardUi) => void;
};

export const EventsActivityMapTab: FC<EventsActivityMapTabProps> = ({
  events,
  listHeight,
  isError,
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

  const {
    mapProps,
    mapRegionKey,
    regionActivities,
    openRoutePlan,
    moveToUserLocation,
  } = useEventsActivityMap({
    events: upcomingEvents,
    region,
    onMarkerOpenDetail: onOpenDetail,
  });

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
        <Map key={mapRegionKey} {...mapProps} />
        {regionActivities.length > 0 ? (
          <>
            <View
              className="s-events-map-tab__locate"
              onClick={moveToUserLocation}
              role="button"
              aria-label="定位到当前位置"
            >
              <Text className="s-events-map-tab__locate-text">定位</Text>
            </View>
            <View
              className="s-events-map-tab__nav"
              onClick={openRoutePlan}
              role="button"
              aria-label="导航到活动"
            >
              <Text className="s-events-map-tab__nav-text">导航</Text>
            </View>
          </>
        ) : (
          <View className="s-events-map-tab__empty-map" aria-hidden>
            <Text className="s-events-map-tab__empty-map-text">该区域暂无活动坐标</Text>
          </View>
        )}
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
          <EventsActivityList
            events={regionActivities}
            isError={isError}
            emptyText="该区域暂无活动"
            onRetry={onRetry}
            onOpenDetail={onOpenDetail}
            onWarmDetail={onWarmDetail}
          />
        </View>
      </ScrollView>
    </View>
  );
};
