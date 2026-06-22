import { Button } from '@/components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { useActivityUpdateSubscribeAction } from '../hooks/useActivityUpdateSubscribeAction';

type ActivityUpdateSubscribeBannerProps = {
  activityLegacyId?: number;
  compact?: boolean;
};

export function ActivityUpdateSubscribeBanner({
  activityLegacyId,
  compact = false,
}: ActivityUpdateSubscribeBannerProps) {
  const t = useT();
  const { subscribed, submitting, handleSubscribe } =
    useActivityUpdateSubscribeAction(activityLegacyId);

  return (
    <View
      className={[
        's-activity-update-subscribe',
        compact && 's-activity-update-subscribe--compact',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Text className="s-activity-update-subscribe__title">
        {t('activityInfo.unpublishedTitle')}
      </Text>
      <Text className="s-activity-update-subscribe__desc">
        {subscribed
          ? t('itinerary.unpublishedBanner.subscribedHint')
          : t('activityInfo.unpublishedHint')}
      </Text>
      <Button
        className={[
          's-activity-update-subscribe__btn',
          subscribed && 's-activity-update-subscribe__btn--subscribed',
          submitting && 's-activity-update-subscribe__btn--loading',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={subscribed || submitting}
        onClick={handleSubscribe}
      >
        <Text className="s-activity-update-subscribe__btn-text">
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
