import './SyncBrandMark.scss';
import { AudioWaveform } from 'lucide-react-taro';
import type { FC } from 'react';
import { Text, View } from '@tarojs/components';

const BRAND_ICON_COLOR = '#4cc9f0';
const BRAND_ICON_SIZE = 24;

export type SyncBrandMarkProps = {
  /** Optional line below SYNC (e.g. events tab). */
  subtitle?: string;
  className?: string;
};

/** Homepage SYNC mark: cyan waveform + bold SYNC wordmark. */
export const SyncBrandMark: FC<SyncBrandMarkProps> = ({ subtitle, className }) => {
  const rootClass = ['s-sync-brand', className].filter(Boolean).join(' ');

  return (
    <View className={rootClass}>
      <AudioWaveform
        size={BRAND_ICON_SIZE}
        color={BRAND_ICON_COLOR}
        className="s-sync-brand__icon"
        aria-hidden
      />
      {subtitle ? (
        <View className="s-sync-brand__copy">
          <Text className="s-sync-brand__logo">SYNC</Text>
          <Text className="s-sync-brand__subtitle">{subtitle}</Text>
        </View>
      ) : (
        <Text className="s-sync-brand__logo">SYNC</Text>
      )}
    </View>
  );
};

export default SyncBrandMark;
