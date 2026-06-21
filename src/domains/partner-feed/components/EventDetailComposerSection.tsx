import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Flame } from '../../../components/icons';
import { EventDetailPrepActions } from './EventDetailPrepActions';
import type { FestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import type { FestivalPlanTask } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import { Button, cn } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type EventDetailComposerSectionProps = {
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
  const [expanded, setExpanded] = useState(false);
  const hasProgress =
    showFestivalPlan && festivalPlanChecklist && festivalPlanChecklist.totalCount > 0;
  const progressPercent = hasProgress
    ? Math.round(
        (festivalPlanChecklist.completedCount / festivalPlanChecklist.totalCount) * 100,
      )
    : 0;

  return (
    <View
      className={cn(
        's-event-detail-festival-prep',
        expanded && 's-event-detail-festival-prep--expanded',
      )}
    >
      <Button
        className="s-event-detail-festival-prep__header"
        hoverClass="s-event-detail-festival-prep__header--pressed"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <View className="s-event-detail-festival-prep__header-main">
          <View className="s-event-detail-festival-prep__icon" aria-hidden>
            <Flame size={18} color="#ff9f0a" />
          </View>
          <View className="s-event-detail-festival-prep__copy">
            <Text className="s-event-detail-festival-prep__title">
              {t('eventDetail.festivalPrepSection')}
            </Text>
            {!expanded ? (
              <Text className="s-event-detail-festival-prep__hint">
                {t('eventDetail.festivalPrepHint')}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="s-event-detail-festival-prep__header-trail">
          {hasProgress ? (
            <View className="s-event-detail-festival-prep__progress-pill">
              <Text className="s-event-detail-festival-prep__progress-text">
                {festivalPlanChecklist.completedCount}/
                {festivalPlanChecklist.totalCount}
              </Text>
            </View>
          ) : null}
          <View className="s-event-detail-festival-prep__chevron" aria-hidden>
            {expanded ? (
              <ChevronUp size={16} color="#ff9f0a" />
            ) : (
              <ChevronDown size={16} color="#ff9f0a" />
            )}
          </View>
        </View>

        {hasProgress ? (
          <View
            className="s-event-detail-festival-prep__progress-bar"
            aria-label={t('festivalPlan.progressAria', {
              completed: String(festivalPlanChecklist.completedCount),
              total: String(festivalPlanChecklist.totalCount),
            })}
          >
            <View
              className="s-event-detail-festival-prep__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        ) : null}
      </Button>

      {expanded ? (
        <View className="s-event-detail-festival-prep__body">
          <EventDetailPrepActions
            travelGuideGenerated={travelGuideGenerated}
            checklist={festivalPlanChecklist}
            showFestivalPlan={showFestivalPlan}
            onAiGuideClick={onAiGuideClick}
            onOpenMyItinerary={onOpenMyItinerary}
            onOpenExclusiveItinerary={onOpenExclusiveItinerary}
            onFestivalPlanTaskPress={onFestivalPlanTaskPress}
          />
        </View>
      ) : null}
    </View>
  );
};
