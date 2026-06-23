import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plane,
  Sparkles,
} from '../../../components/icons';
import { EventDetailPrepActions } from './EventDetailPrepActions';
import type { FestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import type { FestivalPlanTask } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import { Button, cn } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import {
  resolvePrepNudge,
  type PrepNudgeAction,
} from '../utils/eventDetailPlanningHint.util';

export type EventDetailComposerSectionProps = {
  onAiGuideClick: () => void;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
  festivalPlanChecklist?: FestivalPlanChecklist | null;
  onFestivalPlanTaskPress?: (task: FestivalPlanTask) => void;
  showFestivalPlan?: boolean;
  travelGuideGenerated?: boolean;
  travelGuideSupported?: boolean;
  lineupPublished?: boolean;
  favorGenres?: string[];
  unreadReplyCount?: number;
  onPrepNudgeAction?: (action: PrepNudgeAction) => void;
};

export const EventDetailComposerSection: React.FC<EventDetailComposerSectionProps> = ({
  onAiGuideClick,
  onOpenMyItinerary,
  onOpenExclusiveItinerary,
  festivalPlanChecklist,
  onFestivalPlanTaskPress,
  showFestivalPlan = false,
  travelGuideGenerated = false,
  travelGuideSupported = true,
  lineupPublished,
  favorGenres,
  unreadReplyCount = 0,
  onPrepNudgeAction,
}) => {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const hasProgress =
    showFestivalPlan && festivalPlanChecklist && festivalPlanChecklist.totalCount > 0;
  const prepNudge = useMemo(
    () =>
      resolvePrepNudge({
        showFestivalPlan,
        checklist: festivalPlanChecklist,
        lineupPublished,
        favorGenres,
        unreadReplyCount,
        t,
      }),
    [
      festivalPlanChecklist,
      favorGenres,
      lineupPublished,
      showFestivalPlan,
      t,
      unreadReplyCount,
    ],
  );
  const showAccentHint = prepNudge.accent && !expanded;
  const collapsedHint = expanded ? t('eventDetail.festivalPrepHint') : prepNudge.text;
  const hintActionable = !expanded && Boolean(prepNudge.action && onPrepNudgeAction);

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
          className="s-event-detail-planning__row s-event-detail-planning__row--travel"
          hoverClass="s-event-detail-planning__row--pressed"
          aria-label={t('eventDetail.myItinerary')}
          onClick={onOpenMyItinerary}
        >
          <View
            className="s-event-detail-planning__icon s-event-detail-planning__icon--travel"
            aria-hidden
          >
            <Plane size={17} color="#5ac8fa" />
          </View>
          <View className="s-event-detail-planning__row-main">
            <Text className="s-event-detail-planning__row-title">
              {t('eventDetail.myItinerary')}
            </Text>
            <Text className="s-event-detail-planning__row-sub">
              {t('eventDetail.myItinerarySubtitle')}
            </Text>
          </View>
          <ChevronRight size={16} color="#8e8e93" />
        </Button>

        <View className="s-event-detail-planning__hairline" aria-hidden />

        <Button
          className="s-event-detail-planning__row s-event-detail-planning__row--prep"
          hoverClass="s-event-detail-planning__row--pressed"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <View
            className="s-event-detail-planning__icon s-event-detail-planning__icon--prep"
            aria-hidden
          >
            <Sparkles size={17} color="#ffb340" />
          </View>
          <View className="s-event-detail-planning__row-main">
            <Text className="s-event-detail-planning__row-title">
              {t('eventDetail.festivalPrepSection')}
            </Text>
            {hintActionable ? (
              <Button
                className={cn(
                  's-event-detail-planning__row-sub',
                  's-event-detail-planning__row-sub--action',
                  showAccentHint && 's-event-detail-planning__row-sub--accent',
                )}
                hoverClass="s-event-detail-planning__row-sub--action-pressed"
                onClick={(event) => {
                  event.stopPropagation();
                  if (prepNudge.action) {
                    onPrepNudgeAction?.(prepNudge.action);
                  }
                }}
              >
                {collapsedHint}
              </Button>
            ) : (
              <Text
                className={cn(
                  's-event-detail-planning__row-sub',
                  showAccentHint && 's-event-detail-planning__row-sub--accent',
                )}
              >
                {collapsedHint}
              </Text>
            )}
          </View>
          <View className="s-event-detail-planning__row-trail">
            {hasProgress ? (
              <View className="s-event-detail-planning__progress-pill">
                <Text className="s-event-detail-planning__progress-pill-text">
                  {festivalPlanChecklist.completedCount}/
                  {festivalPlanChecklist.totalCount}
                </Text>
              </View>
            ) : null}
            {expanded ? (
              <ChevronUp size={16} color="#8e8e93" />
            ) : (
              <ChevronDown size={16} color="#8e8e93" />
            )}
          </View>
        </Button>

        {expanded ? (
          <View className="s-event-detail-planning__expand">
            <EventDetailPrepActions
              travelGuideGenerated={travelGuideGenerated}
              travelGuideSupported={travelGuideSupported}
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
