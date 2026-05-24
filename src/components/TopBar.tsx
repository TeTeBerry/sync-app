import "./TopBar.scss";
import React from "react";
import { AudioWaveformIcon } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

type TopBarProps = {
  showLanguageSwitch?: boolean;
};

const TopBar: React.FC<TopBarProps> = ({ showLanguageSwitch = false }) => {
  return (
    <div data-cmp="TopBar" className="s-top-bar">
      <div className="s-top-bar__inner">
        <AudioWaveformIcon size={24} className="s-top-bar__icon" />
        <span className="s-top-bar__title">SYNC</span>
      </div>

      {showLanguageSwitch && (
        <div className="s-top-bar__actions">
          <LanguageSwitcher variant="header" />
        </div>
      )}
    </div>
  );
};

export default TopBar;
