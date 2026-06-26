import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type EventDetailUnityIndexProps = {
  recruitCount: number;
  registerCount: number;
  onPostRecruit: () => void;
};

export const EventDetailUnityIndex: FC<EventDetailUnityIndexProps> = ({
  recruitCount,
  registerCount,
  onPostRecruit,
}) => {
  const t = useT();

  if (recruitCount > 0) {
    return (
      <Text className="s-event-detail__unity-index">
        {t('plur.unityIndex.summary', { recruitCount, registerCount })}
      </Text>
    );
  }

  return (
    <View className="s-event-detail__unity-index-row">
      <Text className="s-event-detail__unity-index">
        {t('plur.unityIndex.emptyPrefix')}
      </Text>
      <Text
        className="s-event-detail__unity-index-cta"
        onClick={onPostRecruit}
        role="button"
      >
        {t('plur.unityIndex.emptyCta')}
      </Text>
      <Text className="s-event-detail__unity-index">
        {t('plur.unityIndex.emptySuffix')}
      </Text>
    </View>
  );
};
