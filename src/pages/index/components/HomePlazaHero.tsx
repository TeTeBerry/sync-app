import { BellIcon, SparklesIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "../../../components/ui";

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
  <header className="s-home-hero">
    <div>
      <p className="s-home-hero__kicker">发现 · 探索 · 出发</p>
    </div>

    <div className="s-home-hero__actions">
      <Button className="s-home-icon-btn s-home-icon-btn--primary" onClick={onAgentClick}>
        <SparklesIcon size={18} />
      </Button>
      <Button className="s-home-icon-btn" aria-label="Notifications" onClick={onNotificationClick}>
        <BellIcon size={18} />
        {unreadCount > 0 && <span className="s-home-icon-btn__dot" />}
      </Button>
    </div>
  </header>
);
