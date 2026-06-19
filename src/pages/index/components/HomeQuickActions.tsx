import './HomeQuickActions.scss';
import { CalendarDays, Bot, AudioWaveform } from '../../../components/icons';
import {
  goEventsListTab,
  goPersonalityTest,
  switchTabTo,
  ROUTES,
} from '../../../utils/route';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export const HomeQuickActions = () => {
  const t = useT();

  const actions = [
    {
      id: 'events',
      label: t('home.quickEvents'),
      hint: t('home.quickEventsHint'),
      icon: CalendarDays,
      iconColor: '#ff0066',
      onPress: () => goEventsListTab(),
    },
    {
      id: 'personality',
      label: t('home.quickPersonality'),
      hint: t('home.quickPersonalityHint'),
      icon: AudioWaveform,
      iconColor: '#ff0066',
      onPress: () => goPersonalityTest(),
    },
    {
      id: 'ai',
      label: t('home.quickAi'),
      hint: t('home.quickAiHint'),
      icon: Bot,
      iconColor: '#4cc9f0',
      onPress: () => switchTabTo(ROUTES.AI),
    },
  ] as const;

  return (
    <View className="s-home-quick" aria-label={t('home.quickTitle')}>
      <Text className="s-home-quick__title">{t('home.quickTitle')}</Text>
      <View className="s-home-quick__grid">
        {actions.map((action) => {
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
      <Text className="s-home-quick__note">{t('home.quickNote')}</Text>
    </View>
  );
};
