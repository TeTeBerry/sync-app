import { Text, View } from '@tarojs/components';
import { getLiveInfoCategory } from '../liveInfoConfig';
import type { LiveInfoSummaryRow } from '../liveInfoMock';
import { EventLiveInfoStarRow } from './EventLiveInfoStarRow';

type EventLiveInfoSummaryCardProps = {
  rows: LiveInfoSummaryRow[];
  certCount: number;
};

export function EventLiveInfoSummaryCard({
  rows,
  certCount,
}: EventLiveInfoSummaryCardProps) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <View className="s-live-info-card">
      <View className="s-live-info-card__head">
        <Text className="s-live-info-card__title">现场综合快报</Text>
        <Text className="s-live-info-card__meta">基于 {certCount} 条认证数据</Text>
      </View>
      <View className="s-live-info-summary">
        {safeRows.map((row) => {
          const category = getLiveInfoCategory(row.categoryId);
          const Icon = category.icon;
          const pct = Math.min(100, Math.max(0, (row.score / 5) * 100));
          return (
            <View key={row.categoryId} className="s-live-info-summary__row">
              <View className="s-live-info-summary__label-wrap">
                <Icon size={14} color={category.color} aria-hidden />
                <Text className="s-live-info-summary__label">{category.label}</Text>
              </View>
              <View className="s-live-info-summary__bar-wrap">
                <View className="s-live-info-summary__bar">
                  <View
                    className="s-live-info-summary__bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: category.color }}
                  />
                </View>
              </View>
              <View className="s-live-info-summary__stars-wrap">
                <EventLiveInfoStarRow category={category} score={row.score} />
              </View>
              <Text
                className="s-live-info-summary__score"
                style={{ color: category.color }}
              >
                {row.score.toFixed(1)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
