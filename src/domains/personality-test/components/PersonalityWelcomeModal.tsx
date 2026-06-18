import './PersonalityWelcomeModal.scss';
import { Text, View } from '@tarojs/components';
import { useOverlayLock } from '@/hooks/useOverlayLock';

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
  confirmText = '开始探索',
  loginSaveText = '去登录保存昵称',
}: PersonalityWelcomeModalProps) {
  useOverlayLock(open);

  if (!open) {
    return null;
  }

  const usageLabel = userCount == null ? '查询中…' : `已被 ${userCount} 人使用`;

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
            🎉 欢迎来到 Sync Lab！
          </Text>

          <View className="s-personality-welcome-modal__rows">
            <View className="s-personality-welcome-modal__row">
              <Text className="s-personality-welcome-modal__label">你的昵称</Text>
              <Text className="s-personality-welcome-modal__nickname">{nickname}</Text>
            </View>
            <View className="s-personality-welcome-modal__row">
              <Text className="s-personality-welcome-modal__label">当前状态</Text>
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
                {loginSaveText}
              </Text>
            </View>
          ) : null}
          <View
            className="s-personality-welcome-modal__cta s-personality-welcome-modal__cta--secondary"
            hoverClass="s-personality-welcome-modal__cta--pressed"
            onClick={onClose}
          >
            <Text className="s-personality-welcome-modal__cta-label">
              {confirmText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
