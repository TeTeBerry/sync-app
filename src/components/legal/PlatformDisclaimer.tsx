import './PlatformDisclaimer.scss';
import { getPlatformDisclaimerText } from '../../constants/platformDisclaimer';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type PlatformDisclaimerProps = {
  variant?: 'fixed' | 'inline';
};

export function PlatformDisclaimer({ variant = 'inline' }: PlatformDisclaimerProps) {
  const t = useT();

  return (
    <View
      className={[
        's-platform-disclaimer',
        variant === 'fixed' && 's-platform-disclaimer--fixed',
        variant === 'inline' && 's-platform-disclaimer--inline',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={t('platform.disclaimerAria')}
    >
      <Text className="s-platform-disclaimer__text">{getPlatformDisclaimerText()}</Text>
    </View>
  );
}
