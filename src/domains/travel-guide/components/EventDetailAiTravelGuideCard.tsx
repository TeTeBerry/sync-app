import { ChevronRight, Map } from '../../../components/icons';
import {
  getGenerateTravelGuideCta,
  getViewTravelGuideCta,
} from '../../../constants/aiCtaLabels';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventDetailAiTravelGuideCardProps = {
  generated?: boolean;
  onClick: () => void;
};

export function EventDetailAiTravelGuideCard({
  generated = false,
  onClick,
}: EventDetailAiTravelGuideCardProps) {
  const t = useT();
  const title = generated ? getViewTravelGuideCta() : getGenerateTravelGuideCta();
  const subtitle = generated
    ? t('eventDetail.travelGuideSubtitleGenerated')
    : t('eventDetail.travelGuideSubtitleNew');

  return (
    <View className="s-event-detail__ai-travel-guide">
      <Button
        className="s-event-detail__itinerary-card s-event-detail__itinerary-card--guide"
        hoverClass="s-event-detail__itinerary-card--pressed"
        aria-label={title}
        onClick={onClick}
      >
        <View
          className="s-event-detail__itinerary-card__icon s-event-detail__itinerary-card__icon--guide"
          aria-hidden
        >
          <Map size={20} color="#ff0066" />
        </View>
        <View className="s-event-detail__itinerary-card__body">
          <Text className="s-event-detail__itinerary-card__title">{title}</Text>
          <Text className="s-event-detail__itinerary-card__sub">{subtitle}</Text>
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
