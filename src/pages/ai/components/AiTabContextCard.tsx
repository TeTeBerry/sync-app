import './AiTabContextCard.scss';
import type { FC, ReactNode } from 'react';
import { CalendarDays, ChevronRight, MapPin } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';

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
  if (!showEventContext) {
    return (
      <View className="s-ai-tab-context s-ai-tab-context--pick" aria-label="选择活动">
        <View className="s-ai-tab-context__pick-icon" aria-hidden>
          <MapPin size={18} color="#4cc9f0" />
        </View>
        <View className="s-ai-tab-context__pick-copy">
          <Text className="s-ai-tab-context__pick-title">先选一场活动</Text>
          <Text className="s-ai-tab-context__pick-desc">
            绑定后可生成出行攻略、待办清单与组队建议
          </Text>
        </View>
        <Button
          className="s-ai-tab-context__pick-btn"
          hoverClass="s-ai-tab-context__pick-btn--pressed"
          onClick={onPickActivity}
        >
          <Text className="s-ai-tab-context__pick-btn-text">选择</Text>
          <ChevronRight size={14} color="#4cc9f0" />
        </Button>
      </View>
    );
  }

  return (
    <View className="s-ai-tab-context" aria-label="当前活动与计划">
      <View className="s-ai-tab-context__glow" aria-hidden />

      <View className="s-ai-tab-context__event">
        <View className="s-ai-tab-context__event-icon" aria-hidden>
          <CalendarDays size={16} color="#4cc9f0" />
        </View>
        <View className="s-ai-tab-context__event-copy">
          {activityLoading && !activityTitle ? (
            <Text className="s-ai-tab-context__event-title">加载活动信息…</Text>
          ) : (
            <>
              <Text className="s-ai-tab-context__event-kicker">当前活动</Text>
              <Text className="s-ai-tab-context__event-title">
                {activityTitle ?? '本场活动'}
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
          切换
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
