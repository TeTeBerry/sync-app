import { Calendar, ChevronRight } from '../../../components/icons';
import {
  getGenerateTravelGuideCta,
  getTravelGuideTitle,
  getViewTravelGuideCta,
} from '../../../constants/aiCtaLabels';
import type {
  FestivalPlanChecklist,
  FestivalPlanTask,
} from '@/domains/festival-plan/buildFestivalPlanChecklist';
import { Button, cn } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import './EventDetailPrepActions.scss';

type EventDetailPrepActionsProps = {
  travelGuideGenerated?: boolean;
  checklist?: FestivalPlanChecklist | null;
  showFestivalPlan?: boolean;
  onAiGuideClick: () => void;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
  onFestivalPlanTaskPress?: (task: FestivalPlanTask) => void;
};

type PrepStep = {
  key: string;
  label: string;
  actionLabel: string;
  done: boolean;
  isNext: boolean;
  displayOnly?: boolean;
  onClick: () => void;
};

function taskFromChecklist(
  checklist: FestivalPlanChecklist | null | undefined,
  key: FestivalPlanTask['key'],
): FestivalPlanTask | undefined {
  return checklist?.tasks.find((task) => task.key === key);
}

function buildPlanSteps({
  travelGuideGenerated = false,
  checklist,
  showFestivalPlan = false,
  onAiGuideClick,
  onOpenExclusiveItinerary,
  onFestivalPlanTaskPress,
  t,
}: Pick<
  EventDetailPrepActionsProps,
  | 'travelGuideGenerated'
  | 'checklist'
  | 'showFestivalPlan'
  | 'onAiGuideClick'
  | 'onOpenExclusiveItinerary'
  | 'onFestivalPlanTaskPress'
> & {
  t: (key: string, params?: Record<string, string>) => string;
}): PrepStep[] {
  const travelTask = taskFromChecklist(checklist, 'travel_guide');
  const itineraryTask = taskFromChecklist(checklist, 'itinerary');
  const buddyTask = taskFromChecklist(checklist, 'buddy_post');
  const travelDone = showFestivalPlan
    ? Boolean(travelTask?.done)
    : travelGuideGenerated;

  const steps: PrepStep[] = [
    {
      key: 'travel_guide',
      label: getTravelGuideTitle(),
      actionLabel: travelDone ? getViewTravelGuideCta() : getGenerateTravelGuideCta(),
      done: travelDone,
      isNext: showFestivalPlan ? Boolean(travelTask?.isNext) : false,
      onClick: () => {
        if (showFestivalPlan && travelTask && onFestivalPlanTaskPress) {
          onFestivalPlanTaskPress(travelTask);
          return;
        }
        onAiGuideClick();
      },
    },
    {
      key: 'exclusive_itinerary',
      label: t('ai.itineraryTitle'),
      actionLabel: showFestivalPlan
        ? (itineraryTask?.trailingLabel ?? t('ai.generateItinerary'))
        : t('eventDetail.viewEditLineup'),
      done: showFestivalPlan ? Boolean(itineraryTask?.done) : false,
      isNext: showFestivalPlan ? Boolean(itineraryTask?.isNext) : false,
      onClick: () => {
        if (showFestivalPlan && itineraryTask && onFestivalPlanTaskPress) {
          onFestivalPlanTaskPress(itineraryTask);
          return;
        }
        onOpenExclusiveItinerary();
      },
    },
  ];

  if (showFestivalPlan && buddyTask) {
    steps.push({
      key: 'buddy_post',
      label: buddyTask.done
        ? t('festivalPlan.buddyPostDone')
        : t('festivalPlan.buddyPostTitle'),
      actionLabel: '',
      done: buddyTask.done,
      isNext: buddyTask.isNext,
      displayOnly: true,
      onClick: () => {},
    });
  }

  return steps;
}

function PrepStepNode({
  done,
  isNext,
  isLast,
  lineDone,
}: {
  done: boolean;
  isNext: boolean;
  isLast: boolean;
  lineDone: boolean;
}) {
  return (
    <View className="s-prep-stepper__track" aria-hidden>
      <View
        className={cn(
          's-prep-stepper__node',
          done && 's-prep-stepper__node--done',
          isNext && 's-prep-stepper__node--next',
          !done && !isNext && 's-prep-stepper__node--pending',
        )}
      >
        {done ? <Text className="s-prep-stepper__node-check">✓</Text> : null}
      </View>
      {!isLast ? (
        <View
          className={cn(
            's-prep-stepper__line',
            lineDone && 's-prep-stepper__line--done',
          )}
        />
      ) : null}
    </View>
  );
}

function PrepStepRow({ step, isLast }: { step: PrepStep; isLast: boolean }) {
  const rowClassName = cn(
    's-prep-stepper__row',
    step.done && 's-prep-stepper__row--done',
    step.isNext && !step.displayOnly && 's-prep-stepper__row--next',
    step.displayOnly && 's-prep-stepper__row--static',
  );

  const content = (
    <>
      <Text className="s-prep-stepper__label">{step.label}</Text>
      {!step.displayOnly && step.actionLabel ? (
        <Text
          className={cn(
            's-prep-stepper__action',
            step.isNext && 's-prep-stepper__action--next',
          )}
        >
          {step.actionLabel}
        </Text>
      ) : null}
      {!step.displayOnly ? (
        <ChevronRight size={14} color="#8e8e93" className="s-prep-stepper__chevron" />
      ) : null}
    </>
  );

  return (
    <View className="s-prep-stepper__item">
      <PrepStepNode
        done={step.done}
        isNext={step.isNext}
        isLast={isLast}
        lineDone={step.done}
      />
      {step.displayOnly ? (
        <View className={rowClassName} aria-label={step.label}>
          {content}
        </View>
      ) : (
        <Button
          className={rowClassName}
          hoverClass="s-prep-stepper__row--pressed"
          aria-label={`${step.label} ${step.actionLabel}`}
          onClick={step.onClick}
        >
          {content}
        </Button>
      )}
    </View>
  );
}

function PrepUtilityLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      className="s-prep-stepper__utility"
      hoverClass="s-prep-stepper__utility--pressed"
      aria-label={label}
      onClick={onClick}
    >
      <Calendar size={14} color="#8e8e93" aria-hidden />
      <Text className="s-prep-stepper__utility-label">{label}</Text>
      <ChevronRight size={14} color="#8e8e93" aria-hidden />
    </Button>
  );
}

export function EventDetailPrepActions({
  travelGuideGenerated,
  checklist,
  showFestivalPlan = false,
  onAiGuideClick,
  onOpenMyItinerary,
  onOpenExclusiveItinerary,
  onFestivalPlanTaskPress,
}: EventDetailPrepActionsProps) {
  const t = useT();
  const steps = buildPlanSteps({
    travelGuideGenerated,
    checklist,
    showFestivalPlan,
    onAiGuideClick,
    onOpenExclusiveItinerary,
    onFestivalPlanTaskPress,
    t,
  });
  const allComplete =
    showFestivalPlan && checklist && checklist.totalCount > 0 && !checklist.nextTaskKey;
  const showStepper = showFestivalPlan && Boolean(checklist);

  return (
    <View className="s-prep-stepper">
      {showStepper ? (
        <View className="s-prep-stepper__steps">
          {steps.map((step, index) => (
            <PrepStepRow
              key={step.key}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </View>
      ) : (
        <View className="s-prep-stepper__steps s-prep-stepper__steps--flat">
          {steps.map((step, index) => (
            <PrepStepRow
              key={step.key}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </View>
      )}

      <View className="s-prep-stepper__divider" aria-hidden />

      <PrepUtilityLink
        label={t('eventDetail.myItinerary')}
        onClick={onOpenMyItinerary}
      />

      {allComplete ? (
        <Text className="s-prep-stepper__complete">
          {t('festivalPlan.allComplete')}
        </Text>
      ) : null}
    </View>
  );
}
