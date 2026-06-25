import { memo, useCallback, type FC } from 'react';
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
  onConfirmUnfollow?: (title: string) => Promise<boolean>;
};

type EventsActivityListRowProps = {
  event: EventCardUi;
  onOpenDetail: (legacyId: string) => void;
  onWarmDetail: (event: EventCardUi) => void;
  onConfirmUnfollow?: (title: string) => Promise<boolean>;
};

const EventsActivityListRow = memo(function EventsActivityListRow({
  event,
  onOpenDetail,
  onWarmDetail,
  onConfirmUnfollow,
}: EventsActivityListRowProps) {
  const handleOpen = useCallback(
    () => onOpenDetail(event.id),
    [event.id, onOpenDetail],
  );
  const handleWarm = useCallback(() => onWarmDetail(event), [event, onWarmDetail]);

  return (
    <View className="s-events__card-wrap">
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
        onCardPress={handleOpen}
        onCardPressWarmup={handleWarm}
        onTeamUp={handleOpen}
        onTeamUpWarmup={handleWarm}
        onConfirmUnfollow={onConfirmUnfollow}
      />
    </View>
  );
});

export const EventsActivityList: FC<EventsActivityListProps> = ({
  events,
  isError,
  emptyText,
  onRetry,
  onOpenDetail,
  onWarmDetail,
  onConfirmUnfollow,
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
          <EventsActivityListRow
            key={event.id}
            event={event}
            onOpenDetail={onOpenDetail}
            onWarmDetail={onWarmDetail}
            onConfirmUnfollow={onConfirmUnfollow}
          />
        ))}
      </View>
    </ListState>
  );
};
