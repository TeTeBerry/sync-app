import './NewUserOnboardingSheet.scss';
import { Text, View } from '@tarojs/components';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { useOverlayLock } from '@/hooks/useOverlayLock';
import { useT } from '@/hooks/useI18n';
import { IMAGE_SIZE } from '@/constants/imageSizes';
import { type FeaturedEvent } from '@/utils/apiMappers';
import { formatActivityLocationLabel } from '@/utils/formatActivityDisplay';
import { featuredPostImageUrl, thumbnailImageUrl } from '@/utils/imageUrl';

export type NewUserOnboardingStep = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
};

export type NewUserOnboardingSheetProps = {
  open: boolean;
  steps: NewUserOnboardingStep[];
  featuredEvent?: FeaturedEvent | null;
  featuredEventCount?: number;
  onNextFeaturedEvent?: () => void;
  onDismiss: () => void;
};

export function NewUserOnboardingSheet({
  open,
  steps,
  featuredEvent,
  featuredEventCount = 0,
  onNextFeaturedEvent,
  onDismiss,
}: NewUserOnboardingSheetProps) {
  const t = useT();
  useOverlayLock(open);

  if (!open) {
    return null;
  }

  const venue = featuredEvent ? formatActivityLocationLabel(featuredEvent.venue) : '';
  const metaLine = featuredEvent
    ? venue
      ? `${featuredEvent.date} · ${venue}`
      : featuredEvent.date
    : '';
  const heroSrc = featuredEvent
    ? (featuredPostImageUrl(featuredEvent.image, IMAGE_SIZE.featuredHero) ??
      thumbnailImageUrl(featuredEvent.image, 240) ??
      featuredEvent.image)
    : undefined;
  const showPickAnother = featuredEventCount > 1 && Boolean(onNextFeaturedEvent);

  return (
    <View className="s-overlay s-new-user-onboarding" role="presentation">
      <View className="s-overlay__backdrop" onClick={onDismiss} />
      <View
        className="s-overlay__panel s-new-user-onboarding__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-user-onboarding-title"
      >
        <View className="s-new-user-onboarding__body">
          <Text id="new-user-onboarding-title" className="s-new-user-onboarding__title">
            {t('onboarding.sheetTitle')}
          </Text>
          <Text className="s-new-user-onboarding__subtitle">
            {t('onboarding.sheetSubtitle')}
          </Text>

          {featuredEvent ? (
            <View
              className="s-new-user-onboarding__featured"
              aria-label={featuredEvent.title}
            >
              <View className="s-new-user-onboarding__featured-media">
                {heroSrc ? (
                  <ImageWithFallback
                    src={heroSrc}
                    alt={featuredEvent.title}
                    wrapperClassName="s-new-user-onboarding__featured-media-wrap"
                    imageClassName="s-new-user-onboarding__featured-media-img"
                    fallbackWrapperClassName="s-new-user-onboarding__featured-media-wrap s-new-user-onboarding__featured-media-wrap--fallback"
                    fallback={
                      <Text className="s-new-user-onboarding__featured-media-fallback">
                        {featuredEvent.title}
                      </Text>
                    }
                  />
                ) : (
                  <View className="s-new-user-onboarding__featured-media-wrap s-new-user-onboarding__featured-media-wrap--fallback">
                    <Text className="s-new-user-onboarding__featured-media-fallback">
                      {featuredEvent.title}
                    </Text>
                  </View>
                )}
              </View>
              <View className="s-new-user-onboarding__featured-copy">
                <View className="s-new-user-onboarding__featured-head">
                  <Text className="s-new-user-onboarding__featured-label">
                    {t('onboarding.featuredLabel')}
                  </Text>
                  {showPickAnother ? (
                    <View
                      className="s-new-user-onboarding__featured-switch"
                      hoverClass="s-new-user-onboarding__featured-switch--pressed"
                      onClick={onNextFeaturedEvent}
                      role="button"
                    >
                      <Text className="s-new-user-onboarding__featured-switch-label">
                        {t('onboarding.pickAnother')}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="s-new-user-onboarding__featured-title">
                  {featuredEvent.title}
                </Text>
                {metaLine ? (
                  <Text className="s-new-user-onboarding__featured-meta">
                    {metaLine}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          <View className="s-new-user-onboarding__steps">
            {steps.map((step, index) => (
              <View key={step.title} className="s-new-user-onboarding__step">
                <View className="s-new-user-onboarding__step-head">
                  <Text className="s-new-user-onboarding__step-index">{index + 1}</Text>
                  <Text className="s-new-user-onboarding__step-title">
                    {step.title}
                  </Text>
                </View>
                <Text className="s-new-user-onboarding__step-desc">
                  {step.description}
                </Text>
                <View
                  className={[
                    's-new-user-onboarding__step-cta',
                    step.disabled && 's-new-user-onboarding__step-cta--disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  hoverClass={
                    step.disabled ? '' : 's-new-user-onboarding__step-cta--pressed'
                  }
                  onClick={() => {
                    if (step.disabled) return;
                    step.onAction();
                  }}
                  role="button"
                  aria-disabled={step.disabled}
                >
                  <Text className="s-new-user-onboarding__step-cta-label">
                    {step.actionLabel}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="s-new-user-onboarding__foot">
          <View
            className="s-new-user-onboarding__skip"
            hoverClass="s-new-user-onboarding__skip--pressed"
            onClick={onDismiss}
            role="button"
          >
            <Text className="s-new-user-onboarding__skip-label">
              {t('onboarding.skip')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
