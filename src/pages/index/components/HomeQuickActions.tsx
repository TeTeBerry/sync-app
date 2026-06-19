import './HomeQuickActions.scss';
import type { FC } from 'react';
import { AudioWaveform, Bot, CalendarDays } from '../../../components/icons';
import {
  goEventsListTab,
  goPersonalityTest,
  switchTabTo,
  ROUTES,
} from '../../../utils/route';
import { Text, View } from '@tarojs/components';

const ACTIONS = [
  {
    id: 'events',
    label: '浏览活动',
    hint: '日历 / 地图',
    icon: CalendarDays,
    iconColor: '#ff0066',
    onPress: () => goEventsListTab(),
  },
  {
    id: 'personality',
    label: '电音人格',
    hint: '测完可分享',
    icon: AudioWaveform,
    iconColor: '#ff0066',
    onPress: () => goPersonalityTest(),
  },
  {
    id: 'ai',
    label: 'AI 助手',
    hint: '出行攻略',
    icon: Bot,
    iconColor: '#4cc9f0',
    onPress: () => switchTabTo(ROUTES.AI),
  },
] as const;

export const HomeQuickActions: FC = () => (
  <View className="s-home-quick" aria-label="快捷入口">
    <Text className="s-home-quick__title">快捷入口</Text>
    <View className="s-home-quick__grid">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <View
            key={action.id}
            className="s-home-quick__item"
            onClick={action.onPress}
            role="button"
            aria-label={action.label}
          >
            <View className="s-home-quick__icon-wrap" aria-hidden>
              <Icon size={18} color={action.iconColor} />
            </View>
            <Text className="s-home-quick__label">{action.label}</Text>
            <Text className="s-home-quick__hint">{action.hint}</Text>
          </View>
        );
      })}
    </View>
    <Text className="s-home-quick__note">
      选择活动后可在详情页发布结伴帖；线下结伴请自行甄别风险
    </Text>
  </View>
);
