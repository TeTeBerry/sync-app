import { Star } from "lucide-react-taro";
import { Button, Text, View } from "@tarojs/components";
import type { LiveInfoCategoryConfig } from "../liveInfoConfig";

type EventLiveInfoStarRowProps = {
  category: LiveInfoCategoryConfig;
  score: number;
  interactive?: boolean;
  onScoreChange?: (score: number) => void;
};

export function EventLiveInfoStarRow({
  category,
  score,
  interactive = false,
  onScoreChange,
}: EventLiveInfoStarRowProps) {
  const filled = Math.round(score);

  return (
    <View className="s-live-info-stars">
      <View className="s-live-info-stars__row">
        {Array.from({ length: 5 }, (_, i) => {
          const index = i + 1;
          const active = index <= filled;
          if (interactive && onScoreChange) {
            return (
              <Button
                key={index}
                className="s-live-info-stars__star-btn"
                onClick={() => onScoreChange(index)}>
                <Star
                  size={28}
                  color={active ? category.color : "rgba(255,255,255,0.2)"}
                  filled={active}
                  className="s-live-info-stars__star"
                  aria-hidden
                />
              </Button>
            );
          }
          return (
            <View key={index} className="s-live-info-stars__star-btn">
              <Star
                size={12}
                color={active ? category.color : "rgba(255,255,255,0.2)"}
                filled={active}
                className="s-live-info-stars__star"
                aria-hidden
              />
            </View>
          );
        })}
      </View>
      {interactive ? (
        <View className="s-live-info-stars__scale">
          <Text className="s-live-info-stars__scale-text">{category.scaleLeft}</Text>
          <Text className="s-live-info-stars__scale-text">{category.scaleRight}</Text>
        </View>
      ) : null}
    </View>
  );
}
