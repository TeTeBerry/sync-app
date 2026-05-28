import "./TopBar.scss";
import React from "react";
import { AudioWaveform, Bell } from "lucide-react-taro";
import { Button, Text, View } from '@tarojs/components';

type TopBarProps = {
  variant?: "default" | "home";
  onAgentClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
};

const TopBar: React.FC<TopBarProps> = ({
  variant = "default",
  onAgentClick,
  onNotificationClick,
  notificationCount = 0,
}) => {
  const isHome = variant === "home";
  const badgeLabel = notificationCount > 99 ? "99+" : String(notificationCount);

  return (
    <View data-cmp="TopBar" className={`s-top-bar${isHome ? " s-top-bar--home" : ""}`}>
      <View className="s-top-bar__inner">
        <AudioWaveform size={24} className="s-top-bar__icon" />
        <Text className="s-top-bar__title">SYNC</Text>
      </View>

      {isHome && (
        <View className="s-top-bar__actions">
          <Button type="button" className="s-top-bar__agent-btn" onClick={onAgentClick}>
            Agent
          </Button>
          <Button type="button" className="s-top-bar__bell-btn" aria-label="Notifications" onClick={onNotificationClick}>
            <Bell size={20} />
            {notificationCount > 0 && (
              <Text className="s-top-bar__bell-badge">{badgeLabel}</Text>
            )}
          </Button>
        </View>
      )}

    </View>
  );
};

export default TopBar;
