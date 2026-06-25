import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { EventsKnowledgeCard } from '@/domains/events-search';
import { EventsHotCarousel } from './EventsHotCarousel';
import { EventsActivityList } from './EventsActivityList';
import type { EventCardUi } from '@/utils/apiMappers';
import type { useEventsSearch } from '@/domains/events-search';

type EventsListTabContentProps = {
  events: EventCardUi[];
  isError: boolean;
  emptyText: string;
  onRetry: () => void;
  showKnowledgeCard: boolean;
  knowledgeCardFallback: {
    title: string;
    sections: Array<{ body: string }>;
    sources: string[];
    aiGenerated: false;
  };
  eventsSearch: ReturnType<typeof useEventsSearch>;
  showHotCarousel: boolean;
  hotCarouselEvents: EventCardUi[];
  onOpenDetail: (legacyId: string) => void;
  onWarmDetail: (event: EventCardUi) => void;
  onConfirmUnfollow: (title: string) => Promise<boolean>;
};

export const EventsListTabContent: FC<EventsListTabContentProps> = ({
  events,
  isError,
  emptyText,
  onRetry,
  showKnowledgeCard,
  knowledgeCardFallback,
  eventsSearch,
  showHotCarousel,
  hotCarouselEvents,
  onOpenDetail,
  onWarmDetail,
  onConfirmUnfollow,
}) => {
  const t = useT();

  return (
    <>
      {showKnowledgeCard ? (
        <EventsKnowledgeCard
          card={eventsSearch.knowledgeCard ?? knowledgeCardFallback}
          parsedInsight={eventsSearch.parsedInsight}
          isLoading={eventsSearch.isSearching && !eventsSearch.knowledgeCard}
        />
      ) : null}
      {showHotCarousel ? (
        <EventsHotCarousel
          events={hotCarouselEvents}
          onOpenDetail={onOpenDetail}
          onWarmDetail={onWarmDetail}
        />
      ) : null}
      <View className="s-events__section-head s-events__section-head--list">
        <View className="s-events__section-title">
          <Text>{t('events.allActivities')}</Text>
        </View>
      </View>
      <EventsActivityList
        events={events}
        isError={isError}
        emptyText={emptyText}
        onRetry={onRetry}
        onOpenDetail={onOpenDetail}
        onWarmDetail={onWarmDetail}
        onConfirmUnfollow={onConfirmUnfollow}
      />
    </>
  );
};
