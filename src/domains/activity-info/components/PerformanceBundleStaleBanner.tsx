import { Text } from '@tarojs/components';
import { useMemo } from 'react';
import { Callout } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import { formatPerformanceBundleSavedAt } from '../utils/formatPerformanceBundleSavedAt';
import './PerformanceBundleStaleBanner.scss';

type PerformanceBundleStaleBannerProps = {
  savedAt: number;
};

export function PerformanceBundleStaleBanner({
  savedAt,
}: PerformanceBundleStaleBannerProps) {
  const t = useT();
  const timeLabel = useMemo(() => formatPerformanceBundleSavedAt(savedAt), [savedAt]);

  return (
    <Callout variant="stale" role="status" className="s-performance-bundle-banner">
      <Text>{t('performanceBundle.staleBanner', { time: timeLabel })}</Text>
    </Callout>
  );
}
