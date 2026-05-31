import { TriangleAlert } from "lucide-react-taro";
import { Button, Text, View } from "@tarojs/components";
import type { ItineraryConflict } from "../../../types/backend";
import "./ExclusiveItineraryConflictBanner.scss";

type Props = {
  conflicts: ItineraryConflict[];
  onDismiss?: () => void;
};

export function ExclusiveItineraryConflictBanner({ conflicts, onDismiss }: Props) {
  if (conflicts.length === 0) return null;

  const headline =
    conflicts.length === 1 ? "检测到演出时间冲突" : `检测到 ${conflicts.length} 处演出时间冲突`;

  return (
    <View className="s-exclusive-itinerary-conflict" role="alert">
      <View className="s-exclusive-itinerary-conflict__icon" aria-hidden>
        <TriangleAlert size={18} color="#fbbf24" />
      </View>
      <View className="s-exclusive-itinerary-conflict__body">
        <Text className="s-exclusive-itinerary-conflict__title">{headline}</Text>
        <Text className="s-exclusive-itinerary-conflict__hint">
          你仍可保留全部选择；生成行程时会在时间轴中提示转场。
        </Text>
        {conflicts.slice(0, 2).map((c) => (
          <Text
            key={`${c.artistIds.join("-")}-${c.dateKey}`}
            className="s-exclusive-itinerary-conflict__item"
          >
            {c.message}
          </Text>
        ))}
      </View>
      {onDismiss ? (
        <Button
          className="s-exclusive-itinerary-conflict__close"
          hoverClass="s-exclusive-itinerary-conflict__close--pressed"
          aria-label="关闭"
          onTap={onDismiss}
        >
          <Text>知道了</Text>
        </Button>
      ) : null}
    </View>
  );
}
