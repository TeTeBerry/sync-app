import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plane,
  Sparkles,
} from '../../../components/icons';
import { EventDetailPlurrChecklist } from './EventDetailPlurrChecklist';
import { EventDetailPrepActions } from './EventDetailPrepActions';
import type { FestivalPlanChecklist, FestivalPlanTask } from '@/domains/festival-plan';
import { Button, cn } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import {
  resolvePrepNudge,
  type PrepNudgeAction,
} from '../utils/eventDetailPlanningHint.util';
import { resolveFestivalPrepCollapsedHint } from '../utils/resolveFestivalPrepCollapsedHint';
import { useBuddyMatchProfile } from '../../../hooks/useBuddyMatchProfile';

const PLANNING_ICON_TRAVEL = '#4cc9f0';
const PLANNING_ICON_PREP = '#ff0066';

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
  unreadReplyCount?: number;
  onPrepNudgeAction?: (action: PrepNudgeAction) => void;
  activityLegacyId?: number;
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
  unreadReplyCount = 0,
  onPrepNudgeAction,
  activityLegacyId,
}) => {
  const t = useT();
  const { favorGenres } = useBuddyMatchProfile();
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
  const guidePrepHint = useMemo(
    () =>
      resolveFestivalPrepCollapsedHint({
        travelGuideGenerated,
        travelGuideSupported,
        t,
      }),
    [t, travelGuideGenerated, travelGuideSupported],
  );
  const showAccentHint = prepNudge.accent && !expanded;
  const nudgeActionable =
    !expanded && Boolean(prepNudge.action && onPrepNudgeAction && prepNudge.accent);
  const guideHintActionable = !expanded && guidePrepHint.actionable && !nudgeActionable;
  const collapsedHint = expanded
    ? t('eventDetail.festivalPrepHint')
    : nudgeActionable
      ? prepNudge.text
      : guidePrepHint.text;
  const hintActionable = nudgeActionable || guideHintActionable;
  const showPrepSubtitle = expanded || (hintActionable && collapsedHint);

  return (
    <View data-cmp="EventDetailPlanning" className="s-event-detail-planning">
      <Text className="s-event-detail-planning__section-title">
        {t('eventDetail.planningSectionTitle')}
      </Text>
      <View
        className={cn(
          's-event-detail-planning__card',
          expanded && 's-event-detail-planning__card--expanded',
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
            <Plane size={16} color={PLANNING_ICON_TRAVEL} />
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
            <Sparkles size={16} color={PLANNING_ICON_PREP} />
          </View>
          <View className="s-event-detail-planning__row-main">
            <Text className="s-event-detail-planning__row-title">
              {t('eventDetail.festivalPrepSection')}
            </Text>
            {showPrepSubtitle ? (
              hintActionable ? (
                <Button
                  className={cn(
                    's-event-detail-planning__row-sub',
                    's-event-detail-planning__row-sub--action',
                    showAccentHint && 's-event-detail-planning__row-sub--accent',
                  )}
                  hoverClass="s-event-detail-planning__row-sub--action-pressed"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (nudgeActionable && prepNudge.action) {
                      onPrepNudgeAction?.(prepNudge.action);
                      return;
                    }
                    if (guideHintActionable) {
                      onAiGuideClick();
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
              )
            ) : null}
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
            {activityLegacyId != null && activityLegacyId > 0 ? (
              <EventDetailPlurrChecklist activityLegacyId={activityLegacyId} />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
};
