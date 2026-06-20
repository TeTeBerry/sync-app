import React from 'react';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { EventDetailAiTravelGuideCard } from '@/domains/travel-guide/components/EventDetailAiTravelGuideCard';
import { EventDetailItineraryMenu } from './EventDetailItineraryMenu';
import { FestivalPlanSummaryBar } from '@/domains/festival-plan/FestivalPlanSummaryBar';
import type { FestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import type { FestivalPlanTask } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type EventDetailComposerSectionProps = {
  showHeaderSkeleton: boolean;
  onAiGuideClick: () => void;
  activityTitle?: string;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
  festivalPlanChecklist?: FestivalPlanChecklist | null;
  onFestivalPlanTaskPress?: (task: FestivalPlanTask) => void;
  showFestivalPlan?: boolean;
  travelGuideGenerated?: boolean;
};

export const EventDetailComposerSection: React.FC<EventDetailComposerSectionProps> = ({
  showHeaderSkeleton,
  onAiGuideClick,
  activityTitle,
  onOpenMyItinerary,
  onOpenExclusiveItinerary,
  festivalPlanChecklist,
  onFestivalPlanTaskPress,
  showFestivalPlan = false,
  travelGuideGenerated = false,
}) => {
  const t = useT();
  if (showHeaderSkeleton) {
    return <ThemedPageLoader variant="skeleton-event" minHeight={360} />;
  }

  return (
    <View className="s-event-detail__action-list">
      {showFestivalPlan && festivalPlanChecklist && onFestivalPlanTaskPress ? (
        <View className="s-event-detail__festival-plan">
          <Text className="s-event-detail__festival-plan-kicker">
            {t('eventDetail.personalRecord')}
          </Text>
          <FestivalPlanSummaryBar
            checklist={festivalPlanChecklist}
            onTaskPress={onFestivalPlanTaskPress}
          />
        </View>
      ) : null}
      <EventDetailAiTravelGuideCard
        generated={travelGuideGenerated}
        onClick={onAiGuideClick}
      />
      <EventDetailItineraryMenu
        activityTitle={activityTitle}
        onOpenMyItinerary={onOpenMyItinerary}
        onOpenExclusiveItinerary={onOpenExclusiveItinerary}
      />
    </View>
  );
};
