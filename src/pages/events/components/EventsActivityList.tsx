import type { FC } from 'react';
import { EventCard } from '../../../components/event';
import { ListState } from '../../../components/ListState';
import type { EventCardUi } from '../../../utils/apiMappers';
import { resolveEventCardLegacyId } from '../../../utils/apiMappers';
import { View } from '@tarojs/components';

type EventsActivityListProps = {
  events: EventCardUi[];
  isError: boolean;
  emptyText?: string;
  registeredLegacyIds: Set<number>;
  onRetry: () => void;
  onOpenDetail: (legacyId: string) => void;
  onWarmDetail: (event: EventCardUi) => void;
};

export const EventsActivityList: FC<EventsActivityListProps> = ({
  events,
  isError,
  emptyText = '暂无活动',
  registeredLegacyIds,
  onRetry,
  onOpenDetail,
  onWarmDetail,
}) => {
  return (
    <ListState
      isLoading={false}
      isError={isError}
      isEmpty={!isError && events.length === 0}
      loadingText="加载活动中..."
      errorText="活动列表加载失败"
      emptyText={emptyText}
      onRetry={onRetry}
      retryText="重试"
      stateClassName="s-events__state"
      retryClassName="s-events__retry"
    >
      <View className="s-events__list">
        {events.map((event) => (
          <View
            key={event.id}
            className="s-events__card-wrap"
            role="button"
            tabIndex={0}
            onTouchStart={() => onWarmDetail(event)}
            onClick={() => onOpenDetail(event.id)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              onOpenDetail(event.id);
            }}
          >
            <EventCard
              id={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              image={event.image}
              attendees={event.attendees}
              hot={event.hot}
              category={event.category}
              going={registeredLegacyIds.has(resolveEventCardLegacyId(event.id) ?? -1)}
              variant="list"
              ctaVariant="detail"
              onTeamUp={() => onOpenDetail(event.id)}
              onTeamUpWarmup={() => onWarmDetail(event)}
            />
          </View>
        ))}
      </View>
    </ListState>
  );
};
