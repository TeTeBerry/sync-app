import { Button } from '@/components/ui';
import type { FestivalPlanChip } from './useFestivalPlanSummary';
import { Text, View } from '@tarojs/components';
import './FestivalPlanSummaryBar.scss';

export const FESTIVAL_PLAN_SUMMARY_PX = 52;

export function FestivalPlanSummaryBar({
  chips,
  emptyHint = '暂无本场计划，试试对话里的快捷入口',
  onChipPress,
}: {
  chips: FestivalPlanChip[];
  emptyHint?: string;
  onChipPress: (chip: FestivalPlanChip) => void;
}) {
  return (
    <View className="s-festival-plan-summary">
      <Text className="s-festival-plan-summary__title">本场计划</Text>
      {chips.length > 0 ? (
        <View className="s-festival-plan-summary__chips">
          {chips.map((chip) => (
            <Button
              key={chip.key}
              className="s-festival-plan-summary__chip"
              hoverClass="s-festival-plan-summary__chip--pressed"
              onClick={() => onChipPress(chip)}
            >
              <Text className="s-festival-plan-summary__chip-label">{chip.label}</Text>
            </Button>
          ))}
        </View>
      ) : (
        <Text className="s-festival-plan-summary__empty">{emptyHint}</Text>
      )}
    </View>
  );
}
