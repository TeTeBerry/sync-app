import React from 'react';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { EventDetailAiTravelGuideCard } from '@/domains/travel-guide/components/EventDetailAiTravelGuideCard';
import { EventDetailItineraryMenu } from './EventDetailItineraryMenu';
import { View } from '@tarojs/components';

export type EventDetailComposerSectionProps = {
  showHeaderSkeleton: boolean;
  onAiGuideClick: () => void;
  activityTitle?: string;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
};

export const EventDetailComposerSection: React.FC<EventDetailComposerSectionProps> = ({
  showHeaderSkeleton,
  onAiGuideClick,
  activityTitle,
  onOpenMyItinerary,
  onOpenExclusiveItinerary,
}) => {
  if (showHeaderSkeleton) {
    return <ThemedPageLoader variant="skeleton-event" minHeight={360} />;
  }

  return (
    <View className="s-event-detail__action-list">
      <EventDetailAiTravelGuideCard onClick={onAiGuideClick} />
      <EventDetailItineraryMenu
        activityTitle={activityTitle}
        onOpenMyItinerary={onOpenMyItinerary}
        onOpenExclusiveItinerary={onOpenExclusiveItinerary}
      />
    </View>
  );
};
