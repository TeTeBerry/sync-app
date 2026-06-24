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
      <View className="s-events-header__copy">
        <Text className="s-events-header__title">{t('events.title')}</Text>
        {upcomingCount > 0 ? (
          <View
            className="s-events-header__subtitle"
            aria-label={t('events.upcomingCount', { count: upcomingCount })}
          >
            <View className="s-events-header__subtitle-dot" aria-hidden />
            <Text>{t('events.upcomingCount', { count: upcomingCount })}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};
