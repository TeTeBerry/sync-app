import './NewUserOnboardingSheet.scss';
import { Text, View } from '@tarojs/components';
import { useOverlayLock } from '@/hooks/useOverlayLock';
import { useT } from '@/hooks/useI18n';

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
  onDismiss: () => void;
};

export function NewUserOnboardingSheet({
  open,
  steps,
  onDismiss,
}: NewUserOnboardingSheetProps) {
  const t = useT();
  useOverlayLock(open);

  if (!open) {
    return null;
  }

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
