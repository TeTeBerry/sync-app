import type { FC } from 'react';
import type { NavBarInsets } from '../../../hooks/useNavBarInsets';
import { tabPageHeaderStyle } from '../../../components/navigation/TabPageHeader';
import { Text, View } from '@tarojs/components';

type EventsPageHeaderProps = {
  navInsets: NavBarInsets;
  upcomingCount: number;
};

export const EventsPageHeader: FC<EventsPageHeaderProps> = ({
  navInsets,
  upcomingCount,
}) => {
  return (
    <View
      className="s-events-header"
      style={tabPageHeaderStyle(navInsets, { paddingRightGutterPx: 0 })}
    >
      <Text className="s-events-header__title">活动</Text>
      <View
        className="s-events-header__pill"
        aria-label={`${upcomingCount} 场近期演出`}
      >
        <View className="s-events-header__dot" aria-hidden />
        <Text className="s-events-header__pill-text">{upcomingCount} 场近期演出</Text>
      </View>
    </View>
  );
};
