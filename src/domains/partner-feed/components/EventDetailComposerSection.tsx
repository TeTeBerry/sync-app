import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from '../../../components/icons';
import { EventDetailPrepActions } from './EventDetailPrepActions';
import type { FestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import type { FestivalPlanTask } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import { Button, cn } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { resolvePrepCollapsedHint } from '../utils/eventDetailPlanningHint.util';

export type EventDetailComposerSectionProps = {
  onAiGuideClick: () => void;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
  festivalPlanChecklist?: FestivalPlanChecklist | null;
  onFestivalPlanTaskPress?: (task: FestivalPlanTask) => void;
  showFestivalPlan?: boolean;
  travelGuideGenerated?: boolean;
};

export const EventDetailComposerSection: React.FC<EventDetailComposerSectionProps> = ({
  onAiGuideClick,
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
  const collapsedHint = useMemo(
    () =>
      resolvePrepCollapsedHint({
        showFestivalPlan,
        checklist: festivalPlanChecklist,
        t,
      }),
    [festivalPlanChecklist, showFestivalPlan, t],
  );

  return (
    <View data-cmp="EventDetailPlanning" className="s-event-detail-planning">
      <Text className="s-event-detail-planning__section-title">
        {t('eventDetail.planningSectionKicker')}
      </Text>

      <View
        className={cn(
          's-event-detail-planning__group',
          expanded && 's-event-detail-planning__group--expanded',
        )}
      >
        <Button
          className="s-event-detail-planning__row"
          hoverClass="s-event-detail-planning__row--pressed"
          aria-label={t('eventDetail.myItinerary')}
          onClick={onOpenMyItinerary}
        >
          <View className="s-event-detail-planning__row-main">
            <Text className="s-event-detail-planning__row-title">
              {t('eventDetail.myItinerary')}
            </Text>
            <Text className="s-event-detail-planning__row-sub">
              {t('eventDetail.myItinerarySubtitle')}
            </Text>
          </View>
          <ChevronRight
            size={16}
            color="#636366"
            className="s-event-detail-planning__row-chevron"
          />
        </Button>

        <View className="s-event-detail-planning__hairline" aria-hidden />

        <Button
          className="s-event-detail-planning__row s-event-detail-planning__row--prep"
          hoverClass="s-event-detail-planning__row--pressed"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <View className="s-event-detail-planning__row-main">
            <Text className="s-event-detail-planning__row-title">
              {t('eventDetail.festivalPrepSection')}
            </Text>
            <Text className="s-event-detail-planning__row-sub">
              {expanded ? t('eventDetail.festivalPrepHint') : collapsedHint}
            </Text>
          </View>
          <View className="s-event-detail-planning__row-trail">
            {hasProgress ? (
              <Text className="s-event-detail-planning__progress-label">
                {festivalPlanChecklist.completedCount}/
                {festivalPlanChecklist.totalCount}
              </Text>
            ) : null}
            {expanded ? (
              <ChevronUp size={16} color="#636366" />
            ) : (
              <ChevronDown size={16} color="#636366" />
            )}
          </View>
        </Button>

        {expanded ? (
          <View className="s-event-detail-planning__expand">
            <EventDetailPrepActions
              travelGuideGenerated={travelGuideGenerated}
              checklist={festivalPlanChecklist}
              showFestivalPlan={showFestivalPlan}
              onAiGuideClick={onAiGuideClick}
              onOpenExclusiveItinerary={onOpenExclusiveItinerary}
              onFestivalPlanTaskPress={onFestivalPlanTaskPress}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};
