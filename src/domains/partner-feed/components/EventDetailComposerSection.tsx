import React from 'react';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { EventDetailAiTravelGuideCard } from '@/domains/travel-guide/components/EventDetailAiTravelGuideCard';
import { EventDetailTemplatePostButton } from './EventDetailTemplatePostButton';
import { EventDetailItineraryMenu } from './EventDetailItineraryMenu';
import { View } from '@tarojs/components';

export type EventDetailComposerSectionProps = {
  showHeaderSkeleton: boolean;
  composerReady: boolean;
  templatePublishing?: boolean;
  onAiGuideClick: () => void;
  onOpenTemplateSheet: () => void;
  activityTitle?: string;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
};

export const EventDetailComposerSection: React.FC<EventDetailComposerSectionProps> = ({
  showHeaderSkeleton,
  composerReady,
  templatePublishing,
  onAiGuideClick,
  onOpenTemplateSheet,
  activityTitle,
  onOpenMyItinerary,
  onOpenExclusiveItinerary,
}) => {
  if (showHeaderSkeleton) {
    return <ThemedPageLoader variant="skeleton-event" minHeight={360} />;
  }

  return (
    <View className="s-event-detail__action-list">
      {composerReady ? (
        <>
          <EventDetailAiTravelGuideCard onClick={onAiGuideClick} />
          <EventDetailTemplatePostButton
            disabled={templatePublishing}
            onClick={onOpenTemplateSheet}
          />
        </>
      ) : null}
      <EventDetailItineraryMenu
        activityTitle={activityTitle}
        onOpenMyItinerary={onOpenMyItinerary}
        onOpenExclusiveItinerary={onOpenExclusiveItinerary}
      />
    </View>
  );
};
