import { Calendar, ChevronRight, Music2 } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '../../../hooks/useI18n';

type EventDetailItineraryMenuProps = {
  activityTitle?: string;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
};

function planSubtitleFromTitle(
  title: string | undefined,
  t: (key: string, params?: Record<string, string>) => string,
): string {
  const trimmed = title?.trim();
  if (!trimmed) {
    return t('eventDetail.itinerarySubtitleDefault');
  }
  const core = trimmed.replace(/\s+[^\s]+\s*站$/, '').trim() || trimmed;
  return t('eventDetail.itinerarySubtitle', { core });
}

export function EventDetailItineraryMenu({
  activityTitle,
  onOpenMyItinerary,
  onOpenExclusiveItinerary,
}: EventDetailItineraryMenuProps) {
  const t = useT();
  return (
    <View className="s-event-detail__itinerary-menu">
      <Button
        className="s-event-detail__itinerary-card s-event-detail__itinerary-card--plan"
        hoverClass="s-event-detail__itinerary-card--pressed"
        aria-label={t('eventDetail.myItinerary')}
        onClick={onOpenMyItinerary}
      >
        <View
          className="s-event-detail__itinerary-card__icon s-event-detail__itinerary-card__icon--plan"
          aria-hidden
        >
          <Calendar size={20} color="#ff453a" />
        </View>
        <View className="s-event-detail__itinerary-card__body">
          <Text className="s-event-detail__itinerary-card__title">
            {t('eventDetail.myItinerary')}
          </Text>
          <Text className="s-event-detail__itinerary-card__sub">
            {planSubtitleFromTitle(activityTitle, t)}
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
        aria-label={t('eventDetail.mySchedule')}
        onClick={onOpenExclusiveItinerary}
      >
        <View
          className="s-event-detail__itinerary-card__icon s-event-detail__itinerary-card__icon--edm"
          aria-hidden
        >
          <Music2 size={20} color="#bf5af2" />
        </View>
        <View className="s-event-detail__itinerary-card__body">
          <Text className="s-event-detail__itinerary-card__title">
            {t('eventDetail.mySchedule')}
          </Text>
          <Text className="s-event-detail__itinerary-card__sub">
            {t('eventDetail.viewEditLineup')}
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
