import { useEffect, useState } from 'react';
import { Button, cn } from '@/components/ui';
import { ChevronDown, ChevronUp } from '@/components/icons';
import type {
  FestivalPlanChecklist,
  FestivalPlanTask,
} from './buildFestivalPlanChecklist';
import { resolveFestivalPlanVisibleTasks } from './resolveFestivalPlanVisibleTasks';
import { Text, View } from '@tarojs/components';
import './FestivalPlanSummaryBar.scss';

/** Checklist card below event context — expanded (px @ 375). */
export const FESTIVAL_PLAN_SUMMARY_PX = 148;
/** Default collapsed: header + one next task (px @ 375). */
export const FESTIVAL_PLAN_SUMMARY_COLLAPSED_PX = 92;

export function FestivalPlanSummaryBar({
  checklist,
  onTaskPress,
  onLayoutChange,
  embedded = false,
}: {
  checklist: FestivalPlanChecklist;
  onTaskPress: (task: FestivalPlanTask) => void;
  onLayoutChange?: () => void;
  /** Inside AiTabContextCard — no outer card chrome. */
  embedded?: boolean;
}) {
  const { tasks, completedCount, totalCount, nextTaskKey } = checklist;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [nextTaskKey]);

  useEffect(() => {
    onLayoutChange?.();
  }, [expanded, onLayoutChange, nextTaskKey]);

  const visibleTasks = resolveFestivalPlanVisibleTasks(tasks, {
    expanded,
    nextTaskKey,
  });
  const allComplete = !nextTaskKey;

  return (
    <View
      className={cn(
        's-festival-plan-summary',
        expanded && 's-festival-plan-summary--expanded',
        embedded && 's-festival-plan-summary--embedded',
      )}
    >
      <Button
        className="s-festival-plan-summary__header"
        hoverClass="s-festival-plan-summary__header--pressed"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <Text className="s-festival-plan-summary__title">本场计划</Text>
        <View className="s-festival-plan-summary__header-trail">
          <Text className="s-festival-plan-summary__progress">
            {completedCount}/{totalCount}
          </Text>
          {expanded ? (
            <ChevronUp size={14} color="var(--muted-foreground)" aria-hidden />
          ) : (
            <ChevronDown size={14} color="var(--muted-foreground)" aria-hidden />
          )}
        </View>
      </Button>

      {embedded && totalCount > 0 ? (
        <View
          className="s-festival-plan-summary__progress-bar"
          aria-label={`计划进度 ${completedCount}/${totalCount}`}
        >
          <View
            className="s-festival-plan-summary__progress-fill"
            style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
          />
        </View>
      ) : null}

      {visibleTasks.length > 0 ? (
        <View className="s-festival-plan-summary__tasks">
          {visibleTasks.map((task) => (
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
      ) : null}

      {expanded && nextTaskKey ? (
        <Text className="s-festival-plan-summary__hint">
          下一步：{tasks.find((task) => task.key === nextTaskKey)?.trailingLabel}
        </Text>
      ) : null}

      {allComplete ? (
        <Text className="s-festival-plan-summary__hint s-festival-plan-summary__hint--complete">
          本场准备已完成，祝你玩得开心
        </Text>
      ) : null}
    </View>
  );
}
