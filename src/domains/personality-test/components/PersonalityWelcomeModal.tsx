import './PersonalityWelcomeModal.scss';
import { Text, View } from '@tarojs/components';
import { useOverlayLock } from '@/hooks/useOverlayLock';
import { useT } from '@/hooks/useI18n';

export type PersonalityWelcomeModalProps = {
  open: boolean;
  nickname: string;
  userCount: number | null;
  onClose: () => void;
  onLoginSave?: () => void;
  confirmText?: string;
  loginSaveText?: string;
};

export function PersonalityWelcomeModal({
  open,
  nickname,
  userCount,
  onClose,
  onLoginSave,
  confirmText,
  loginSaveText,
}: PersonalityWelcomeModalProps) {
  useOverlayLock(open);
  const t = useT();
  const resolvedConfirmText = confirmText ?? t('personality.welcomeExplore');
  const resolvedLoginSaveText = loginSaveText ?? t('personality.welcomeLoginSave');

  if (!open) {
    return null;
  }

  const usageLabel =
    userCount == null
      ? t('common.loading')
      : t('personality.usageCount', { count: userCount });

  return (
    <View className="s-overlay s-personality-welcome-modal" role="presentation">
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-personality-welcome-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="personality-welcome-title"
      >
        <View className="s-personality-welcome-modal__body">
          <Text
            id="personality-welcome-title"
            className="s-personality-welcome-modal__title"
          >
            {t('personality.welcomeTitle')}
          </Text>

          <View className="s-personality-welcome-modal__rows">
            <View className="s-personality-welcome-modal__row">
              <Text className="s-personality-welcome-modal__label">
                {t('personality.nicknameLabel')}
              </Text>
              <Text className="s-personality-welcome-modal__nickname">{nickname}</Text>
            </View>
            <View className="s-personality-welcome-modal__row">
              <Text className="s-personality-welcome-modal__label">
                {t('personality.statusLabel')}
              </Text>
              <Text className="s-personality-welcome-modal__status">{usageLabel}</Text>
            </View>
          </View>
        </View>

        <View
          className={[
            's-personality-welcome-modal__foot',
            onLoginSave && 's-personality-welcome-modal__foot--dual',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {onLoginSave ? (
            <View
              className="s-personality-welcome-modal__cta"
              hoverClass="s-personality-welcome-modal__cta--pressed"
              onClick={onLoginSave}
            >
              <Text className="s-personality-welcome-modal__cta-label">
                {resolvedLoginSaveText}
              </Text>
            </View>
          ) : null}
          <View
            className="s-personality-welcome-modal__cta s-personality-welcome-modal__cta--secondary"
            hoverClass="s-personality-welcome-modal__cta--pressed"
            onClick={onClose}
          >
            <Text className="s-personality-welcome-modal__cta-label">
              {resolvedConfirmText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
