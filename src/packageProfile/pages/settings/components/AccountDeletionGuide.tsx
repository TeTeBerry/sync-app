import Taro from '@tarojs/taro';
import { Text, View } from '@tarojs/components';
import { Button } from '../../../../components/ui';
import { useT } from '@/hooks/useI18n';
import { SUPPORT_EMAIL } from '../../../../constants/supportContact';

type AccountDeletionGuideProps = {
  onStartDeletionFeedback: () => void;
};

export function AccountDeletionGuide({
  onStartDeletionFeedback,
}: AccountDeletionGuideProps) {
  const t = useT();

  const copyEmail = () => {
    void Taro.setClipboardData({
      data: SUPPORT_EMAIL,
      success: () => {
        void Taro.showToast({
          title: t('accountDeletion.emailCopied'),
          icon: 'success',
        });
      },
    });
  };

  return (
    <View className="s-settings-help__deletion">
      <Text className="s-settings-help__deletion-title">
        {t('accountDeletion.title')}
      </Text>
      <Text className="s-settings-help__deletion-desc">
        {t('accountDeletion.description')}
      </Text>

      <View className="s-settings__card s-settings-help__deletion-card">
        <Text className="s-settings-help__deletion-step-title">
          {t('accountDeletion.methodsTitle')}
        </Text>
        <Text className="s-settings-help__deletion-step">
          {t('accountDeletion.method1', { email: SUPPORT_EMAIL })}
        </Text>
        <Text className="s-settings-help__deletion-step">
          {t('accountDeletion.method2')}
        </Text>
        <View className="s-settings-help__deletion-actions">
          <Button className="s-settings-help__deletion-btn" onClick={copyEmail}>
            <Text className="s-btn-label">{t('accountDeletion.copyEmail')}</Text>
          </Button>
          <Button
            className="s-settings-help__deletion-btn s-settings-help__deletion-btn--primary"
            onClick={onStartDeletionFeedback}
          >
            <Text className="s-btn-label">{t('accountDeletion.submitDeletion')}</Text>
          </Button>
        </View>
      </View>

      <View className="s-settings__card s-settings-help__deletion-card">
        <Text className="s-settings-help__deletion-step-title">
          {t('accountDeletion.dataTitle')}
        </Text>
        <Text key="account" className="s-settings-help__deletion-bullet">
          · {t('accountDeletion.dataItems.account')}
        </Text>
        <Text key="profile" className="s-settings-help__deletion-bullet">
          · {t('accountDeletion.dataItems.profile')}
        </Text>
        <Text key="posts" className="s-settings-help__deletion-bullet">
          · {t('accountDeletion.dataItems.posts')}
        </Text>
        <Text key="tools" className="s-settings-help__deletion-bullet">
          · {t('accountDeletion.dataItems.tools')}
        </Text>
        <Text className="s-settings-help__deletion-footnote">
          {t('accountDeletion.dataHint')}
        </Text>
      </View>
    </View>
  );
}
