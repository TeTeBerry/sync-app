import { Button } from '../../../components/ui';
import { requireAuth } from '../../../utils/authGate';
import { requestActivityUpdateSubscribe } from '../../../utils/wechatSubscribeMessage';
import { Text, View } from '@tarojs/components';

type ExclusiveItineraryUnpublishedBannerProps = {
  showEmptyLineup?: boolean;
};

export function ExclusiveItineraryUnpublishedBanner({
  showEmptyLineup = false,
}: ExclusiveItineraryUnpublishedBannerProps) {
  const handleSubscribe = () => {
    requireAuth(() => {
      void requestActivityUpdateSubscribe();
    }, 'notification');
  };

  return (
    <View className="s-exclusive-itinerary__unpublished">
      <Text className="s-exclusive-itinerary__unpublished-title">
        {showEmptyLineup
          ? t('itinerary.unpublishedBanner.title', {
              text: t('itinerary.unpublishedBanner.lineupNotAnnounced'),
            })
          : t('itinerary.unpublishedBanner.title', {
              text: t('itinerary.unpublishedBanner.scheduleNotPublished'),
            })}
      </Text>
      <Text className="s-exclusive-itinerary__unpublished-desc">
        {t('itinerary.unpublishedBanner.hint')}
      </Text>
      <Button
        className="s-exclusive-itinerary__unpublished-btn"
        onClick={handleSubscribe}
      >
        <Text className="s-exclusive-itinerary__unpublished-btn-text">
          {t('itinerary.unpublishedBanner.subscribe')}
        </Text>
      </Button>
    </View>
  );
}
