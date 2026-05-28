import { AudioWaveform, Bell, Sparkles } from "lucide-react-taro";
import type { FC } from "react";
import { Button } from "../../../components/ui";
import { Text, View } from '@tarojs/components';

type HomePlazaHeroProps = {
  unreadCount: number;
  onAgentClick: () => void;
  onNotificationClick: () => void;
};

export const HomePlazaHero: FC<HomePlazaHeroProps> = ({
  unreadCount,
  onAgentClick,
  onNotificationClick,
}) => (
  <View className="s-home-hero">
    <View className="s-home-hero__brand">
      <AudioWaveform size={24} className="s-home-hero__icon" />
      <Text className="s-home-hero__logo">SYNC</Text>
    </View>

    <View className="s-home-hero__actions">
      <Button className="s-home-icon-btn s-home-icon-btn--primary" onClick={onAgentClick}>
        <Sparkles size={18} />
      </Button>
      <Button className="s-home-icon-btn" aria-label="Notifications" onClick={onNotificationClick}>
        <Bell size={18} />
        {unreadCount > 0 && <Text className="s-home-icon-btn__dot" />}
      </Button>
    </View>
  </View>
);
