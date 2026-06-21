import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { useActivityUpdateSubscribeAction } from './useActivityUpdateSubscribeAction';

type ExclusiveItineraryUnpublishedBannerProps = {
  activityLegacyId?: number;
  showEmptyLineup?: boolean;
};

export function ExclusiveItineraryUnpublishedBanner({
  activityLegacyId,
  showEmptyLineup = false,
}: ExclusiveItineraryUnpublishedBannerProps) {
  const t = useT();
  const { subscribed, submitting, handleSubscribe } =
    useActivityUpdateSubscribeAction(activityLegacyId);

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
        {subscribed
          ? t('itinerary.unpublishedBanner.subscribedHint')
          : t('itinerary.unpublishedBanner.hint')}
      </Text>
      <Button
        className={[
          's-exclusive-itinerary__unpublished-btn',
          subscribed && 's-exclusive-itinerary__unpublished-btn--subscribed',
          submitting && 's-exclusive-itinerary__unpublished-btn--loading',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={subscribed || submitting}
        onClick={handleSubscribe}
      >
        <Text className="s-exclusive-itinerary__unpublished-btn-text">
          {subscribed
            ? t('itinerary.unpublishedBanner.subscribed')
            : submitting
              ? t('itinerary.unpublishedBanner.subscribing')
              : t('itinerary.unpublishedBanner.subscribe')}
        </Text>
      </Button>
    </View>
  );
}
