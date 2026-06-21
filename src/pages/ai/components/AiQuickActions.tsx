import './AiQuickActions.scss';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import type { FestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import type { FestivalPlanTaskPressHandler } from '@/domains/festival-plan/festivalPlanTaskActions';
import { buildAiQuickActionItems } from './buildAiQuickActionItems';
import { cn } from '@/components/ui/cn';

type AiQuickActionsProps = {
  checklist: FestivalPlanChecklist;
  onLineupPress: () => void;
  onSchedulePress: () => void;
  onTaskPress: FestivalPlanTaskPressHandler;
  onLayoutChange?: () => void;
};

export const AiQuickActions: FC<AiQuickActionsProps> = ({
  checklist,
  onLineupPress,
  onSchedulePress,
  onTaskPress,
  onLayoutChange,
}) => {
  const t = useT();
  const items = buildAiQuickActionItems({
    checklist,
    onLineupPress,
    onSchedulePress,
    onTaskPress,
  });

  useEffect(() => {
    onLayoutChange?.();
  }, [checklist, onLayoutChange]);

  return (
    <View className="s-ai-quick-actions" aria-label={t('ai.quickActionsTitle')}>
      <Text className="s-ai-quick-actions__title">{t('ai.quickActionsTitle')}</Text>
      <View className="s-ai-quick-actions__scroll">
        <View className="s-ai-quick-actions__row">
          {items.map((item) => (
            <Button
              key={item.key}
              className={cn(
                's-ai-quick-actions__chip',
                item.isNext && 's-ai-quick-actions__chip--next',
              )}
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
