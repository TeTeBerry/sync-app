import './AiQuickActions.scss';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { buildAiQuickActionItems } from './buildAiQuickActionItems';

type AiQuickActionsProps = {
  onLineupPress: () => void;
  onSchedulePress: () => void;
  hasItinerary?: boolean;
  onLayoutChange?: () => void;
};

export const AiQuickActions: FC<AiQuickActionsProps> = ({
  onLineupPress,
  onSchedulePress,
  hasItinerary = false,
  onLayoutChange,
}) => {
  const t = useT();
  const items = buildAiQuickActionItems({
    onLineupPress,
    onSchedulePress,
    hasItinerary,
  });

  useEffect(() => {
    onLayoutChange?.();
  }, [hasItinerary, onLayoutChange]);

  return (
    <View className="s-ai-quick-actions" aria-label={t('ai.quickActionsTitle')}>
      <Text className="s-ai-quick-actions__title">{t('ai.quickActionsTitle')}</Text>
      <View className="s-ai-quick-actions__scroll">
        <View className="s-ai-quick-actions__row">
          {items.map((item) => (
            <Button
              key={item.key}
              className="s-ai-quick-actions__chip"
              hoverClass="s-ai-quick-actions__chip--pressed"
              onClick={item.onPress}
            >
              <Text className="s-ai-quick-actions__chip-text">{item.label}</Text>
            </Button>
          ))}
        </View>
      </View>
    </View>
  );
};
