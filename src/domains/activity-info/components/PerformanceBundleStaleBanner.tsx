import { Text, View } from '@tarojs/components';
import { useMemo } from 'react';
import { useT } from '@/hooks/useI18n';
import './PerformanceBundleStaleBanner.scss';

type PerformanceBundleStaleBannerProps = {
  savedAt: number;
};

function formatSavedAt(savedAt: number): string {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export function PerformanceBundleStaleBanner({
  savedAt,
}: PerformanceBundleStaleBannerProps) {
  const t = useT();
  const timeLabel = useMemo(() => formatSavedAt(savedAt), [savedAt]);

  return (
    <View className="s-performance-bundle-banner" role="status">
      <Text className="s-performance-bundle-banner__text">
        {t('performanceBundle.staleBanner', { time: timeLabel })}
      </Text>
    </View>
  );
}
