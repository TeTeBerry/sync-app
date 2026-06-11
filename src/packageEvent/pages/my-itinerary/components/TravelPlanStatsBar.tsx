import { Text, View } from '@tarojs/components';
import { formatTravelPlanCost } from '../travelPlanMock';
import type { TravelPlanStats } from '../travelPlanTypes';

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
      <View className="s-travel-plan__stats-divider" aria-hidden />
      <View className="s-travel-plan__stats-item">
        <Text className="s-travel-plan__stats-value">
          <Text className="s-travel-plan__stats-value--confirmed">
            {stats.confirmedCount}
          </Text>
          <Text className="s-travel-plan__stats-value--muted">/{stats.nodeCount}</Text>
        </Text>
        <Text className="s-travel-plan__stats-label">已确认</Text>
      </View>
    </View>
  );
}
