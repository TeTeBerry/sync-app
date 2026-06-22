import type { FC } from 'react';
import { EventCard } from '../../../components/event';
import { ListState } from '../../../components/ListState';
import type { EventCardUi } from '../../../utils/apiMappers';
import { View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

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
  emptyText,
  onRetry,
  onOpenDetail,
  onWarmDetail,
}) => {
  const t = useT();
  const finalEmptyText = emptyText ?? t('events.empty');
  return (
    <ListState
      isLoading={false}
      isError={isError}
      isEmpty={!isError && events.length === 0}
      loadingText={t('events.loading')}
      errorText={t('events.loadFailed')}
      emptyText={finalEmptyText}
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
              going={event.going}
              category={event.category}
              region={event.region}
              area={event.area}
              lineupPublished={event.lineupPublished}
              recruitPostCount={event.recruitPostCount}
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
