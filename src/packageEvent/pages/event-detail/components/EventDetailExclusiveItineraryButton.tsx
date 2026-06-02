import { ChevronRight, Music2 } from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';

type EventDetailExclusiveItineraryButtonProps = {
  onPress: () => void;
};

export function EventDetailExclusiveItineraryButton({
  onPress,
}: EventDetailExclusiveItineraryButtonProps) {
  return (
    <View className="s-event-detail__itinerary-wrap">
      <Button
        className="s-event-detail__itinerary-btn"
        hoverClass="s-event-detail__itinerary-btn--pressed"
        aria-label="专属电音行程"
        onClick={onPress}
      >
        <View className="s-event-detail__itinerary-btn__icon" aria-hidden>
          <Music2 size={18} color="#ffffff" />
        </View>
        <Text className="s-event-detail__itinerary-btn__label">专属电音行程</Text>
        <ChevronRight
          size={18}
          color="#ffffff"
          className="s-event-detail__itinerary-btn__chevron"
          aria-hidden
        />
      </Button>
    </View>
  );
}
