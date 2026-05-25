import "./TopBar.scss";
import React from "react";
import { AudioWaveformIcon, BellIcon } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

type TopBarProps = {
  showLanguageSwitch?: boolean;
  variant?: "default" | "home";
  onAgentClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
};

const TopBar: React.FC<TopBarProps> = ({
  showLanguageSwitch = false,
  variant = "default",
  onAgentClick,
  onNotificationClick,
  notificationCount = 0,
}) => {
  const isHome = variant === "home";
  const badgeLabel = notificationCount > 99 ? "99+" : String(notificationCount);

  return (
    <div data-cmp="TopBar" className={`s-top-bar${isHome ? " s-top-bar--home" : ""}`}>
      <div className="s-top-bar__inner">
        <AudioWaveformIcon size={24} className="s-top-bar__icon" />
        <span className="s-top-bar__title">SYNC</span>
      </div>

      {isHome && (
        <div className="s-top-bar__actions">
          <button type="button" className="s-top-bar__agent-btn" onClick={onAgentClick}>
            Agent
          </button>
          <button type="button" className="s-top-bar__bell-btn" aria-label="Notifications" onClick={onNotificationClick}>
            <BellIcon size={20} />
            {notificationCount > 0 && (
              <span className="s-top-bar__bell-badge">{badgeLabel}</span>
            )}
          </button>
        </div>
      )}

      {!isHome && showLanguageSwitch && (
        <div className="s-top-bar__actions">
          <LanguageSwitcher variant="header" />
        </div>
      )}
    </div>
  );
};

export default TopBar;
