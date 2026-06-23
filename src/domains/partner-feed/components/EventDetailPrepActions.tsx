import { ChevronRight } from '../../../components/icons';
import type { FestivalPlanChecklist, FestivalPlanTask } from '@/domains/festival-plan';
import { Button, cn } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import {
  buildEventDetailPrepSteps,
  type EventDetailPrepStep,
} from '../utils/eventDetailPrepSteps.util';
import './EventDetailPrepActions.scss';

type EventDetailPrepActionsProps = {
  travelGuideGenerated?: boolean;
  travelGuideSupported?: boolean;
  checklist?: FestivalPlanChecklist | null;
  showFestivalPlan?: boolean;
  onAiGuideClick: () => void;
  onOpenExclusiveItinerary: () => void;
  onFestivalPlanTaskPress?: (task: FestivalPlanTask) => void;
};

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

function PrepStepRow({ step, isLast }: { step: EventDetailPrepStep; isLast: boolean }) {
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

export function EventDetailPrepActions({
  travelGuideGenerated,
  travelGuideSupported = true,
  checklist,
  showFestivalPlan = false,
  onAiGuideClick,
  onOpenExclusiveItinerary,
  onFestivalPlanTaskPress,
}: EventDetailPrepActionsProps) {
  const t = useT();
  const steps = buildEventDetailPrepSteps({
    travelGuideGenerated,
    travelGuideSupported,
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

      {allComplete ? (
        <Text className="s-prep-stepper__complete">
          {t('festivalPlan.allComplete')}
        </Text>
      ) : null}
    </View>
  );
}
