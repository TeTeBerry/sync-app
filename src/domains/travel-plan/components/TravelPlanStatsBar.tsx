import { Text, View } from '@tarojs/components';
import { formatTravelPlanCost } from '../utils/travelPlanStats';
import type { TravelPlanStats } from '../types';

type TravelPlanStatsBarProps = {
  stats: TravelPlanStats;
};

export function TravelPlanStatsBar({ stats }: TravelPlanStatsBarProps) {
  return (
    <View className="s-travel-plan__stats">
      <View className="s-travel-plan__stats-item">
        <Text className="s-travel-plan__stats-value">{stats.nodeCount}</Text>
        <Text className="s-travel-plan__stats-label">行程节点</Text>
      </View>
      <View className="s-travel-plan__stats-divider" aria-hidden />
      <View className="s-travel-plan__stats-item">
        <Text className="s-travel-plan__stats-value">
          {formatTravelPlanCost(stats.estimatedCost)}
        </Text>
        <Text className="s-travel-plan__stats-label">预计花费</Text>
      </View>
    </View>
  );
}
