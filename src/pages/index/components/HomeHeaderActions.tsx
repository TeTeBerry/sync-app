import { Bell } from '../../../components/icons';
import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { Button } from '../../../components/ui';

type HomeHeaderActionsProps = {
  unreadCount: number;
  onNotificationClick: () => void;
};

/** Home tab trailing actions for TabPageHeader. */
export const HomeHeaderActions: FC<HomeHeaderActionsProps> = ({
  unreadCount,
  onNotificationClick,
}) => (
  <View className="s-home-header-actions">
    <Button
      className="s-home-icon-btn"
      aria-label="Notifications"
      onClick={onNotificationClick}
    >
      <Bell size={18} color="#ffffff" />
      {unreadCount > 0 && <Text className="s-home-icon-btn__dot" />}
    </Button>
  </View>
);
