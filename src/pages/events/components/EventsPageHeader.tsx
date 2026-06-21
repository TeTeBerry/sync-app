import type { FC } from 'react';
import type { NavBarInsets } from '../../../hooks/useNavBarInsets';
import { tabPageHeaderStyle } from '../../../components/navigation/TabPageHeader';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventsPageHeaderProps = {
  navInsets: NavBarInsets;
  upcomingCount: number;
};

export const EventsPageHeader: FC<EventsPageHeaderProps> = ({
  navInsets,
  upcomingCount,
}) => {
  const t = useT();
  return (
    <View
      className="s-events-header"
      style={tabPageHeaderStyle(navInsets, { paddingRightGutterPx: 0 })}
    >
      <Text className="s-events-header__title">{t('events.title')}</Text>
      <View
        className="s-events-header__pill"
        aria-label={t('events.upcomingCount', { count: upcomingCount })}
      >
        <View className="s-events-header__dot" aria-hidden />
        <Text className="s-events-header__pill-text">
          {t('events.upcomingCount', { count: upcomingCount })}
        </Text>
      </View>
    </View>
  );
};
