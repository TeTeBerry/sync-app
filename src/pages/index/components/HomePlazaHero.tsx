import { AudioWaveform, Bell, Sparkles } from "lucide-react-taro";
import type { FC } from "react";
import { Button } from "../../../components/ui";
import { Text, View } from '@tarojs/components';

type HomePlazaHeroProps = {
  unreadCount: number;
  capsulePaddingTop?: number;
  capsulePaddingRight?: number;
  onAgentClick: () => void;
  onNotificationClick: () => void;
};

export const HomePlazaHero: FC<HomePlazaHeroProps> = ({
  unreadCount,
  capsulePaddingTop = 0,
  capsulePaddingRight = 0,
  onAgentClick,
  onNotificationClick,
}) => {
  const heroStyle =
    capsulePaddingTop> 0 || capsulePaddingRight> 16
      ? {
          ...(capsulePaddingTop> 0 ? { paddingTop: `${capsulePaddingTop}px` } : {}),
          ...(capsulePaddingRight> 16
            ? { paddingRight: `${capsulePaddingRight - 16}px` }
            : {}),
        }
      : undefined;

  return (
  <View className="s-home-hero" style={heroStyle}>
    <View className="s-home-hero__brand">
      <AudioWaveform size={24} color="#4cc9f0" className="s-home-hero__icon" />
      <Text className="s-home-hero__logo">SYNC</Text>
    </View>

    <View className="s-home-hero__actions">
      <Button className="s-home-icon-btn s-home-icon-btn--primary" onClick={onAgentClick}>
        <Sparkles size={18} color="#ffffff" />
      </Button>
      <Button className="s-home-icon-btn" aria-label="Notifications" onClick={onNotificationClick}>
        <Bell size={18} color="#ffffff" />
        {unreadCount> 0 && <Text className="s-home-icon-btn__dot" />}
      </Button>
    </View>
  </View>
  );
};
