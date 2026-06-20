import './AiTabContextCard.scss';
import type { FC, ReactNode } from 'react';
import { CalendarDays, ChevronRight, MapPin } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type AiTabContextCardProps = {
  showEventContext: boolean;
  activityLoading: boolean;
  activityTitle?: string;
  activityMeta?: string;
  onSwitchActivity?: () => void;
  onPickActivity?: () => void;
  planSlot?: ReactNode;
};

export const AiTabContextCard: FC<AiTabContextCardProps> = ({
  showEventContext,
  activityLoading,
  activityTitle,
  activityMeta,
  onSwitchActivity,
  onPickActivity,
  planSlot,
}) => {
  const t = useT();
  if (!showEventContext) {
    return (
      <View
        className="s-ai-tab-context s-ai-tab-context--pick"
        aria-label={t('ai.pickActivityTitle')}
      >
        <View className="s-ai-tab-context__pick-icon" aria-hidden>
          <MapPin size={18} color="#4cc9f0" />
        </View>
        <View className="s-ai-tab-context__pick-copy">
          <Text className="s-ai-tab-context__pick-title">
            {t('ai.pickActivityTitle')}
          </Text>
          <Text className="s-ai-tab-context__pick-desc">
            {t('ai.pickActivityDesc')}
          </Text>
        </View>
        <Button
          className="s-ai-tab-context__pick-btn"
          hoverClass="s-ai-tab-context__pick-btn--pressed"
          onClick={onPickActivity}
        >
          <Text className="s-ai-tab-context__pick-btn-text">
            {t('ai.pickActivityBtn')}
          </Text>
          <ChevronRight size={14} color="#4cc9f0" />
        </Button>
      </View>
    );
  }

  return (
    <View className="s-ai-tab-context" aria-label={t('ai.currentActivity')}>
      <View className="s-ai-tab-context__glow" aria-hidden />

      <View className="s-ai-tab-context__event">
        <View className="s-ai-tab-context__event-icon" aria-hidden>
          <CalendarDays size={16} color="#4cc9f0" />
        </View>
        <View className="s-ai-tab-context__event-copy">
          {activityLoading && !activityTitle ? (
            <Text className="s-ai-tab-context__event-title">
              {t('ai.loadingActivity')}
            </Text>
          ) : (
            <>
              <Text className="s-ai-tab-context__event-kicker">
                {t('ai.currentActivity')}
              </Text>
              <Text className="s-ai-tab-context__event-title">
                {activityTitle ?? t('ai.thisActivity')}
              </Text>
              {activityMeta ? (
                <Text className="s-ai-tab-context__event-meta">{activityMeta}</Text>
              ) : null}
            </>
          )}
        </View>
        <Button
          className="s-ai-tab-context__switch"
          hoverClass="s-ai-tab-context__switch--pressed"
          onClick={onSwitchActivity}
        >
          {t('ai.switchActivity')}
        </Button>
      </View>

      {planSlot ? (
        <>
          <View className="s-ai-tab-context__divider" aria-hidden />
          <View className="s-ai-tab-context__plan">{planSlot}</View>
        </>
      ) : null}
    </View>
  );
};
