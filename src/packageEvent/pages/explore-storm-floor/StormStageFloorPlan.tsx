import type { CSSProperties } from 'react';
import { Image, View } from '@tarojs/components';
import stormStageFloor from '../../assets/storm-stage-floor.png';
import { StormFloorCrowdDots } from './StormFloorCrowdDots';
import { StormStageScreen } from './StormStageScreen';
import { useStormFloorLive } from './useStormFloorLive';

export function StormStageFloorPlan() {
  const { currentPerformance, crowdDots } = useStormFloorLive();

  return (
    <View className="s-explore-storm-floor__art">
      <Image
        className="s-explore-storm-floor__img"
        src={stormStageFloor}
        mode="widthFix"
        showMenuByLongpress
      />
      <StormStageScreen performance={currentPerformance} />
      <StormFloorCrowdDots dots={crowdDots} />
      <View className="s-explore-storm-floor__glow s-explore-storm-floor__glow--title" />
      <View
        className="s-explore-storm-floor__glow s-explore-storm-floor__glow--screens"
        style={
          {
            '--storm-screen-accent': currentPerformance.genreColor,
          } as CSSProperties
        }
      />
      <View className="s-explore-storm-floor__glow s-explore-storm-floor__glow--screen-flash" />
      <View className="s-explore-storm-floor__glow s-explore-storm-floor__glow--platform" />
      <View className="s-explore-storm-floor__glow s-explore-storm-floor__glow--rim" />
      <View
        className="s-explore-storm-floor__glow s-explore-storm-floor__glow--beam"
        style={
          {
            '--storm-screen-accent': currentPerformance.genreColor,
          } as CSSProperties
        }
      />
    </View>
  );
}
