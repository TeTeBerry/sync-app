import type { CSSProperties } from 'react';
import { Text, View } from '@tarojs/components';
import {
  formatStormPerformanceSlot,
  type StormFloorPerformance,
} from './stormFloorSchedule';

type StormStageScreenProps = {
  performance: StormFloorPerformance;
};

export function StormStageScreen({ performance }: StormStageScreenProps) {
  const accent = performance.genreColor || '#7b61ff';

  return (
    <View
      className="s-explore-storm-floor__screen"
      style={
        {
          '--storm-screen-accent': accent,
        } as CSSProperties
      }
    >
      <Text className="s-explore-storm-floor__screen-name">
        {performance.artistName}
      </Text>
      <Text className="s-explore-storm-floor__screen-slot">
        {formatStormPerformanceSlot(performance)}
      </Text>
    </View>
  );
}
