import { Bell, Sparkles } from "lucide-react-taro";
import type { FC } from "react";
import { Text } from "@tarojs/components";
import { Button } from "../../../components/ui";

type HomeHeaderActionsProps = {
  unreadCount: number;
  onAgentClick: () => void;
  onNotificationClick: () => void;
};

/** Home tab trailing actions for TabPageHeader. */
export const HomeHeaderActions: FC<HomeHeaderActionsProps> = ({
  unreadCount,
  onAgentClick,
  onNotificationClick,
}) => (
  <>
    <Button className="s-home-icon-btn s-home-icon-btn--primary" onClick={onAgentClick}>
      <Sparkles size={18} color="#ffffff" />
    </Button>
    <Button
      className="s-home-icon-btn"
      aria-label="Notifications"
      onClick={onNotificationClick}>
      <Bell size={18} color="#ffffff" />
      {unreadCount > 0 && <Text className="s-home-icon-btn__dot" />}
    </Button>
  </>
);
