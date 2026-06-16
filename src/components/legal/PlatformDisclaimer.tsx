import './PlatformDisclaimer.scss';
import { PLATFORM_DISCLAIMER_TEXT } from '../../constants/platformDisclaimer';
import { Text, View } from '@tarojs/components';

export type PlatformDisclaimerProps = {
  variant?: 'fixed' | 'inline';
};

export function PlatformDisclaimer({ variant = 'inline' }: PlatformDisclaimerProps) {
  return (
    <View
      className={[
        's-platform-disclaimer',
        variant === 'fixed' && 's-platform-disclaimer--fixed',
        variant === 'inline' && 's-platform-disclaimer--inline',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="平台声明"
    >
      <Text className="s-platform-disclaimer__text">{PLATFORM_DISCLAIMER_TEXT}</Text>
    </View>
  );
}
