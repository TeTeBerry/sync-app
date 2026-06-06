import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CoverView, Map, ScrollView, Text, View } from '@tarojs/components';
import type { ActivityMapRegion } from '../../../constants/activityMapRegion';
import { getActivityStatusFromActivity } from '../../../utils/activityStatus';
import type { EventCardUi } from '../../../utils/apiMappers';
import { useEventsActivityMap } from '../hooks/useEventsActivityMap';
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

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(false);
    const timer = setTimeout(() => setMapReady(true), 80);
    return () => clearTimeout(timer);
  }, [mapRegionKey, upcomingEvents.length]);

  const listScrollHeight =
    listHeight != null
      ? Math.max(listHeight - EVENTS_MAP_STAGE_PX - 52, 160)
      : undefined;

  const regionHint =
    region === 'domestic'
      ? '国内近期活动 — 点击地图标记查看详情'
      : region === 'overseas'
        ? '海外近期活动 — 点击地图标记查看详情'
        : '港澳台近期活动 — 点击地图标记查看详情';

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
        {mapReady ? <Map key={mapRegionKey} {...mapProps} /> : null}
        <CoverView className="s-events-map-tab__locate" onClick={moveToUserLocation}>
          <CoverView className="s-events-map-tab__locate-text">我的位置</CoverView>
        </CoverView>
        <CoverView className="s-events-map-tab__nav" onClick={openRoutePlan}>
          <CoverView className="s-events-map-tab__nav-text">导航</CoverView>
        </CoverView>
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
          <Text className="s-events-map-tab__hint">{regionHint}</Text>
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
