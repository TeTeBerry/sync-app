import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { useActivityUpdateSubscribeAction } from '@/domains/activity-info';

type ExclusiveItineraryUnpublishedBannerProps = {
  activityLegacyId?: number;
  activityTitle?: string;
  showEmptyLineup?: boolean;
};

export function ExclusiveItineraryUnpublishedBanner({
  activityLegacyId,
  activityTitle,
  showEmptyLineup = false,
}: ExclusiveItineraryUnpublishedBannerProps) {
  const t = useT();
  const titleLabel = activityTitle?.trim() || t('eventCard.activityFallback');
  const { subscribed, submitting, handleSubscribe } = useActivityUpdateSubscribeAction(
    activityLegacyId,
    false,
    {
      toggleable: false,
    },
  );

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
          ? t('itinerary.unpublishedBanner.subscribedHint', { title: titleLabel })
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
            ? t('itinerary.unpublishedBanner.subscribed', { title: titleLabel })
            : submitting
              ? t('itinerary.unpublishedBanner.subscribing')
              : t('itinerary.unpublishedBanner.subscribe', { title: titleLabel })}
        </Text>
      </Button>
    </View>
  );
}
