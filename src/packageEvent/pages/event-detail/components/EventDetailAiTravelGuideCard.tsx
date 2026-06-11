import { ChevronRight, Map } from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';

type EventDetailAiTravelGuideCardProps = {
  onClick: () => void;
};

export function EventDetailAiTravelGuideCard({
  onClick,
}: EventDetailAiTravelGuideCardProps) {
  return (
    <View className="s-event-detail__ai-travel-guide">
      <Button
        className="s-event-detail__itinerary-card s-event-detail__itinerary-card--guide"
        hoverClass="s-event-detail__itinerary-card--pressed"
        aria-label="AI出行攻略"
        onClick={onClick}
      >
        <View
          className="s-event-detail__itinerary-card__icon s-event-detail__itinerary-card__icon--guide"
          aria-hidden
        >
          <Map size={20} color="#ff0066" />
        </View>
        <View className="s-event-detail__itinerary-card__body">
          <Text className="s-event-detail__itinerary-card__title">AI出行攻略</Text>
          <Text className="s-event-detail__itinerary-card__sub">
            智能规划出行 · 住宿 · 交通
          </Text>
        </View>
        <ChevronRight
          size={18}
          color="#ff0066"
          className="s-event-detail__itinerary-card__chevron"
          aria-hidden
        />
      </Button>
    </View>
  );
}
