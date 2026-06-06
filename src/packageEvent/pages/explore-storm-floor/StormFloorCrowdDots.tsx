import { View } from '@tarojs/components';
import type { StormFloorDot } from './stormFloorZones';

type StormFloorCrowdDotsProps = {
  dots: StormFloorDot[];
};

export function StormFloorCrowdDots({ dots }: StormFloorCrowdDotsProps) {
  return (
    <>
      {dots.map((dot) => (
        <View
          key={dot.id}
          className="s-explore-storm-floor__dot"
          style={{
            top: `${dot.top}%`,
            left: `${dot.left}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: dot.color,
            boxShadow: `0 0 ${dot.size * 1.6}px ${dot.color}`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
    </>
  );
}
