import type { FC } from 'react';
import { EventCard } from '../../../components/event';
import { ListState } from '../../../components/ListState';
import type { EventCardUi } from '../../../utils/apiMappers';
import { View } from '@tarojs/components';

type EventsActivityListProps = {
  events: EventCardUi[];
  isError: boolean;
  emptyText?: string;
  onRetry: () => void;
  onOpenDetail: (legacyId: string) => void;
  onWarmDetail: (event: EventCardUi) => void;
};

export const EventsActivityList: FC<EventsActivityListProps> = ({
  events,
  isError,
  emptyText = t('events.empty'),
  onRetry,
  onOpenDetail,
  onWarmDetail,
}) => {
  const t = useT();
  return (
    <ListState
      isLoading={false}
      isError={isError}
      isEmpty={!isError && events.length === 0}
      loadingText={t('events.loading')}
      errorText={t('events.loadFailed')}
      emptyText={emptyText}
      onRetry={onRetry}
      retryText={t('common.retry')}
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
              variant="list"
              onTeamUp={() => onOpenDetail(event.id)}
              onTeamUpWarmup={() => onWarmDetail(event)}
            />
          </View>
        ))}
      </View>
    </ListState>
  );
};
