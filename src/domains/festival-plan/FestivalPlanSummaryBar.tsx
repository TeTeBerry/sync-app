import { Button, cn } from '@/components/ui';
import type {
  FestivalPlanChecklist,
  FestivalPlanTask,
} from './buildFestivalPlanChecklist';
import { Text, View } from '@tarojs/components';
import './FestivalPlanSummaryBar.scss';

/** Checklist card below event context (px @ 375). */
export const FESTIVAL_PLAN_SUMMARY_PX = 148;

export function FestivalPlanSummaryBar({
  checklist,
  onTaskPress,
}: {
  checklist: FestivalPlanChecklist;
  onTaskPress: (task: FestivalPlanTask) => void;
}) {
  const { tasks, completedCount, totalCount, nextTaskKey } = checklist;

  return (
    <View className="s-festival-plan-summary">
      <View className="s-festival-plan-summary__header">
        <Text className="s-festival-plan-summary__title">本场计划</Text>
        <Text className="s-festival-plan-summary__progress">
          {completedCount}/{totalCount}
        </Text>
      </View>

      <View className="s-festival-plan-summary__tasks">
        {tasks.map((task) => (
          <Button
            key={task.key}
            className={cn(
              's-festival-plan-summary__task',
              task.done && 's-festival-plan-summary__task--done',
              task.isNext && 's-festival-plan-summary__task--next',
            )}
            hoverClass="s-festival-plan-summary__task--pressed"
            onClick={() => onTaskPress(task)}
          >
            <Text
              className={cn(
                's-festival-plan-summary__marker',
                task.done && 's-festival-plan-summary__marker--done',
              )}
              aria-hidden
            >
              {task.done ? '✓' : '○'}
            </Text>
            <Text className="s-festival-plan-summary__task-label">{task.label}</Text>
            <Text
              className={cn(
                's-festival-plan-summary__task-action',
                task.isNext &&
                  !task.done &&
                  's-festival-plan-summary__task-action--next',
              )}
            >
              {task.trailingLabel}
            </Text>
          </Button>
        ))}
      </View>

      {nextTaskKey ? (
        <Text className="s-festival-plan-summary__hint">
          下一步：{tasks.find((task) => task.key === nextTaskKey)?.trailingLabel}
        </Text>
      ) : (
        <Text className="s-festival-plan-summary__hint s-festival-plan-summary__hint--complete">
          本场准备已完成，祝你玩得开心
        </Text>
      )}
    </View>
  );
}
