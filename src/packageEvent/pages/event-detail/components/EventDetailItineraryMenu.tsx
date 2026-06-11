import { Calendar, ChevronRight, Music2 } from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';

type EventDetailItineraryMenuProps = {
  activityTitle?: string;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
};

function planSubtitleFromTitle(title?: string): string {
  const trimmed = title?.trim();
  if (!trimmed) {
    return '查看 · 编辑风暴电音节行程';
  }
  const core = trimmed.replace(/\s+[^\s]+\s*站$/, '').trim() || trimmed;
  return `查看 · 编辑${core}行程`;
}

export function EventDetailItineraryMenu({
  activityTitle,
  onOpenMyItinerary,
  onOpenExclusiveItinerary,
}: EventDetailItineraryMenuProps) {
  return (
    <View className="s-event-detail__itinerary-menu">
      <Button
        className="s-event-detail__itinerary-card s-event-detail__itinerary-card--plan"
        hoverClass="s-event-detail__itinerary-card--pressed"
        aria-label="我的行程计划"
        onClick={onOpenMyItinerary}
      >
        <View
          className="s-event-detail__itinerary-card__icon s-event-detail__itinerary-card__icon--plan"
          aria-hidden
        >
          <Calendar size={20} color="#ff453a" />
        </View>
        <View className="s-event-detail__itinerary-card__body">
          <Text className="s-event-detail__itinerary-card__title">我的行程计划</Text>
          <Text className="s-event-detail__itinerary-card__sub">
            {planSubtitleFromTitle(activityTitle)}
          </Text>
        </View>
        <ChevronRight
          size={18}
          color="#ff453a"
          className="s-event-detail__itinerary-card__chevron"
          aria-hidden
        />
      </Button>

      <Button
        className="s-event-detail__itinerary-card s-event-detail__itinerary-card--edm"
        hoverClass="s-event-detail__itinerary-card--pressed"
        aria-label="我的电音时间表"
        onClick={onOpenExclusiveItinerary}
      >
        <View
          className="s-event-detail__itinerary-card__icon s-event-detail__itinerary-card__icon--edm"
          aria-hidden
        >
          <Music2 size={20} color="#bf5af2" />
        </View>
        <View className="s-event-detail__itinerary-card__body">
          <Text className="s-event-detail__itinerary-card__title">我的电音时间表</Text>
          <Text className="s-event-detail__itinerary-card__sub">
            查看·编辑我的演出阵容
          </Text>
        </View>
        <ChevronRight
          size={18}
          color="#bf5af2"
          className="s-event-detail__itinerary-card__chevron"
          aria-hidden
        />
      </Button>
    </View>
  );
}
