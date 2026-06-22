import './ActivityUpdateSubscribeBanner.scss';
import { Button } from '@/components/ui';
import { Music2 } from '@/components/icons';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { useActivityUpdateSubscribeAction } from '../hooks/useActivityUpdateSubscribeAction';

type ActivityUpdateSubscribeBannerVariant = 'banner' | 'hero';

type ActivityUpdateSubscribeBannerProps = {
  activityLegacyId?: number;
  activityTitle?: string;
  /** @deprecated Use `variant="banner"` instead */
  compact?: boolean;
  variant?: ActivityUpdateSubscribeBannerVariant;
};

export function ActivityUpdateSubscribeBanner({
  activityLegacyId,
  activityTitle,
  compact = false,
  variant,
}: ActivityUpdateSubscribeBannerProps) {
  const t = useT();
  const resolvedVariant = variant ?? (compact ? 'banner' : 'banner');
  const isHero = resolvedVariant === 'hero';
  const titleLabel = activityTitle?.trim() || t('eventCard.activityFallback');
  const { subscribed, submitting, handleSubscribe } = useActivityUpdateSubscribeAction(
    activityLegacyId,
    false,
    {
      toggleable: false,
    },
  );

  const btnClassName = [
    isHero
      ? 's-activity-update-subscribe__btn--hero'
      : 's-activity-update-subscribe__btn--banner',
    subscribed && 's-activity-update-subscribe__btn--subscribed',
    submitting && 's-activity-update-subscribe__btn--loading',
  ]
    .filter(Boolean)
    .join(' ');

  const btnText = subscribed
    ? t('itinerary.unpublishedBanner.subscribed', { title: titleLabel })
    : submitting
      ? t('itinerary.unpublishedBanner.subscribing')
      : t('itinerary.unpublishedBanner.subscribe', { title: titleLabel });

  return (
    <View
      className={[
        's-activity-update-subscribe',
        isHero
          ? 's-activity-update-subscribe--hero'
          : 's-activity-update-subscribe--banner',
      ].join(' ')}
    >
      {isHero ? (
        <>
          <View className="s-activity-update-subscribe__hero-glow" aria-hidden />
          <View className="s-activity-update-subscribe__icon-wrap" aria-hidden>
            <Music2 size={28} color="var(--primary)" strokeWidth={2.25} />
          </View>
          <View className="s-activity-update-subscribe__badge">
            <Text className="s-activity-update-subscribe__badge-text">
              {t('activityInfo.unpublishedBadge')}
            </Text>
          </View>
        </>
      ) : null}

      <Text className="s-activity-update-subscribe__title">
        {t('activityInfo.unpublishedTitle')}
      </Text>
      <Text className="s-activity-update-subscribe__desc">
        {subscribed
          ? t('itinerary.unpublishedBanner.subscribedHint', { title: titleLabel })
          : t('activityInfo.unpublishedHint')}
      </Text>

      {isHero && !subscribed ? (
        <View className="s-activity-update-subscribe__features" aria-hidden>
          <View className="s-activity-update-subscribe__feature">
            <View className="s-activity-update-subscribe__feature-dot" />
            <Text className="s-activity-update-subscribe__feature-text">
              {t('activityInfo.unpublishedFeatureLineup')}
            </Text>
          </View>
          <View className="s-activity-update-subscribe__feature">
            <View className="s-activity-update-subscribe__feature-dot" />
            <Text className="s-activity-update-subscribe__feature-text">
              {t('activityInfo.unpublishedFeatureSchedule')}
            </Text>
          </View>
        </View>
      ) : null}

      <Button
        className={btnClassName}
        hoverClass={
          isHero ? 's-activity-update-subscribe__btn--hero--pressed' : undefined
        }
        disabled={subscribed || submitting}
        onClick={handleSubscribe}
      >
        <Text className="s-activity-update-subscribe__btn-text">{btnText}</Text>
      </Button>
    </View>
  );
}
